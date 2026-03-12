import React, { useState } from 'react';
import toast from 'react-hot-toast';

const ImageUpload = ({ onUploadSuccess, currentImage, type = 'avatar' }) => {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(currentImage || '');

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Basic validation
        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size should be less than 5MB');
            return;
        }

        // Preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result);
        };
        reader.readAsDataURL(file);

        // Call success with the file object to be uploaded by the parent
        // OR upload directly here
        onUploadSuccess(file);
    };

    return (
        <div className={`image-upload-wrapper ${type}`}>
            <div className="image-preview">
                {preview ? (
                    <img src={preview} alt="Preview" className={type === 'avatar' ? 'avatar-img' : 'post-img'} />
                ) : (
                    <div className="placeholder">
                        <i className={`fas ${type === 'avatar' ? 'fa-user' : 'fa-image'} fa-3x`}></i>
                    </div>
                )}
            </div>
            <label className="btn btn-light upload-btn">
                {uploading ? 'Uploading...' : `Choose ${type === 'avatar' ? 'Avatar' : 'Image'}`}
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                />
            </label>
        </div>
    );
};

export default ImageUpload;
