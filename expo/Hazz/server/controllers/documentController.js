const GlobalDocument = require('../models/GlobalDocument');
const Employee = require('../models/Employee');
const logAudit = require('../utils/auditLogger');
const cloudinary = require('cloudinary').v2;
const { getAuth } = require('@clerk/express');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.uploadDocument = async (req, res) => {
  try {
    const adminId = getAuth(req).userId;
    const { title, forceResign } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'No PDF file uploaded.' });
    }
    if (!title) {
      return res.status(400).json({ message: 'Document title is required.' });
    }

    // Upload to Cloudinary using memory buffer
    const uploadToCloudinary = () => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: 'raw', folder: 'hajj_agreements' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });
    };

    const cloudinaryResult = await uploadToCloudinary();

    // Determine the next version number
    const lastDoc = await GlobalDocument.findOne().sort({ version: -1 });
    const nextVersion = lastDoc ? lastDoc.version + 1 : 1;

    // Set all other documents to inactive
    await GlobalDocument.updateMany({}, { isActive: false });

    // Create the new active document
    const newDoc = await GlobalDocument.create({
      title,
      version: nextVersion,
      fileUrl: cloudinaryResult.secure_url,
      isActive: true,
      uploadedBy: adminId
    });

    // If forceResign is true, we update all employees
    if (forceResign === 'true' || forceResign === true) {
      await Employee.updateMany(
        { agreementStatus: 'signed' },
        { $set: { agreementStatus: 'pending' } }
      );
    }

    await logAudit(req, adminId, 'UPLOADED_DOCUMENT', `Uploaded new Master Agreement: ${title} (v${nextVersion}). Force Re-sign: ${forceResign === 'true' || forceResign === true}`);
    res.status(201).json({ success: true, data: newDoc });
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({ message: 'Server error uploading document' });
  }
};

exports.getActiveDocument = async (req, res) => {
  try {
    const doc = await GlobalDocument.findOne({ isActive: true });
    if (!doc) {
      return res.status(404).json({ message: 'No active document found' });
    }
    res.status(200).json({ success: true, data: doc });
  } catch (error) {
    console.error('Error fetching active document:', error);
    res.status(500).json({ message: 'Server error fetching active document' });
  }
};

exports.getAllDocuments = async (req, res) => {
  try {
    const docs = await GlobalDocument.find().sort({ version: -1 });
    res.status(200).json({ success: true, data: docs });
  } catch (error) {
    console.error('Error fetching all documents:', error);
    res.status(500).json({ message: 'Server error fetching documents' });
  }
};
