import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const AddEducation = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        school: '',
        degree: '',
        fieldofstudy: '',
        from: '',
        to: '',
        current: false,
        description: ''
    });

    const [loading, setLoading] = useState(false);

    const { school, degree, fieldofstudy, from, to, current, description } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put('/profile/education', formData);
            toast.success('Education added!');
            navigate('/profile');
        } catch (err) {
            toast.error(err.response?.data?.msg || 'Failed to add education');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="profile-form-container">
            <div className="profile-form">
                <div className="form-header">
                    <h1>Add Your Education</h1>
                    <p>Add any school, bootcamp, etc that you have attended</p>
                    <small>* = required field</small>
                </div>

                <form onSubmit={onSubmit}>
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="* School or Bootcamp"
                            name="school"
                            value={school}
                            onChange={onChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="* Degree or Certificate"
                            name="degree"
                            value={degree}
                            onChange={onChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="Field of Study"
                            name="fieldofstudy"
                            value={fieldofstudy}
                            onChange={onChange}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">From Date</label>
                        <input
                            type="date"
                            name="from"
                            value={from}
                            onChange={onChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input
                                type="checkbox"
                                name="current"
                                checked={current}
                                value={current}
                                onChange={onChange}
                                id="current-edu"
                            />{' '}
                            <label htmlFor="current-edu" className="form-label" style={{ marginBottom: 0 }}>Current School</label>
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">To Date</label>
                        <input
                            type="date"
                            name="to"
                            value={to}
                            onChange={onChange}
                            disabled={current}
                        />
                    </div>
                    <div className="form-group">
                        <textarea
                            name="description"
                            cols="30"
                            rows="5"
                            placeholder="Program Description"
                            value={description}
                            onChange={onChange}
                        ></textarea>
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Adding...' : 'Add Education'}
                        </button>
                        <Link className="btn btn-light" to="/profile">Go Back</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddEducation;
