import React, { useState, useEffect } from 'react';
import { FiImage, FiPlus, FiTrash2, FiLink, FiAlignLeft, FiX, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '../../../services/reqInterceptor';
import { uploadCarouselImageToCloudinary } from '../../../utils/uploadToCloudinary';
import './CarouselManagement.css';

const CarouselManagement = () => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    link: '',
    priority: 0,
  });

  const fetchSlides = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/carousel');
      setSlides(data);
    } catch (err) {
      toast.error('Failed to load carousel slides');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const objectUrl = URL.createObjectURL(file);
      setImagePreview(objectUrl);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSlide = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      toast.error('Please select an image for the slide');
      return;
    }
    if (!formData.title.trim()) {
      toast.error('Please provide a title');
      return;
    }

    setIsSubmitting(true);
    try {
      toast.loading('Uploading image...', { id: 'addSlide' });
      const { url, publicId } = await uploadCarouselImageToCloudinary(imageFile);

      toast.loading('Saving slide...', { id: 'addSlide' });
      await api.post('/carousel', {
        imageUrl: url,
        publicId: publicId,
        title: formData.title,
        description: formData.description,
        link: formData.link,
        priority: Number(formData.priority) || 0,
      });

      toast.success('Slide added successfully!', { id: 'addSlide' });
      setIsModalOpen(false);
      resetForm();
      fetchSlides();
    } catch (err) {
      toast.error(err.message || 'Failed to add slide', { id: 'addSlide' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSlide = async (id) => {
    if (!window.confirm('Are you sure you want to delete this slide?')) return;

    try {
      toast.loading('Deleting slide...', { id: 'deleteSlide' });
      await api.delete(`/carousel/${id}`);
      toast.success('Slide deleted successfully', { id: 'deleteSlide' });
      setSlides((prev) => prev.filter((slide) => slide._id !== id));
    } catch (err) {
      toast.error('Failed to delete slide', { id: 'deleteSlide' });
    }
  };

  const resetForm = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData({
      title: '',
      description: '',
      link: '',
      priority: 0,
    });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  return (
    <div className="carousel-management-page">
      <div className="carousel-header">
        <div>
          <h1>Carousel Management</h1>
          <p>Manage the slides displayed on the public landing page</p>
        </div>
        <button className="add-slide-btn" onClick={() => setIsModalOpen(true)}>
          <FiPlus /> Add New Slide
        </button>
      </div>

      <div className="carousel-grid">
        {loading ? (
          <div className="loading-spinner">Loading slides...</div>
        ) : slides.length === 0 ? (
          <div className="empty-state">
            <FiImage size={48} />
            <p>No carousel slides found. Add your first slide!</p>
          </div>
        ) : (
          slides.map((slide) => (
            <div className="slide-card" key={slide._id}>
              <div className="slide-image-wrapper">
                <img src={slide.imageUrl} alt={slide.title} className="slide-image" />
                <div className="slide-actions">
                  <button 
                    className="delete-btn" 
                    onClick={() => handleDeleteSlide(slide._id)}
                    title="Delete Slide"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
              <div className="slide-content">
                <div className="slide-title">
                  <h3>{slide.title}</h3>
                  <span className="priority-badge" title="Priority (Higher is displayed first)">
                    P{slide.priority}
                  </span>
                </div>
                {slide.description && (
                  <p className="slide-desc"><FiAlignLeft /> {slide.description}</p>
                )}
                {slide.link && (
                  <p className="slide-link"><FiLink /> {slide.link}</p>
                )}
                <div className="slide-footer">
                  <span className="status-active"><FiCheckCircle /> Active</span>
                  <span className="slide-date">Added {new Date(slide.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add New Slide</h2>
              <button className="close-btn" onClick={closeModal}><FiX /></button>
            </div>
            
            <form onSubmit={handleAddSlide} className="add-slide-form">
              <div className="form-group image-upload-group">
                <label>Slide Image *</label>
                <div className="image-preview-area">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="preview-image" />
                  ) : (
                    <div className="placeholder-preview">
                      <FiImage size={40} />
                      <span>Select an image to preview</span>
                    </div>
                  )}
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange}
                  id="slide-image-input"
                  className="file-input"
                />
                <label htmlFor="slide-image-input" className="file-input-label">
                  Choose Image
                </label>
              </div>

              <div className="form-group">
                <label>Title *</label>
                <input 
                  type="text" 
                  name="title" 
                  value={formData.title} 
                  onChange={handleInputChange} 
                  placeholder="e.g. Summer Collection 2026"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleInputChange} 
                  placeholder="e.g. Get up to 50% off on all items..."
                  rows="3"
                ></textarea>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Link URL</label>
                  <input 
                    type="text" 
                    name="link" 
                    value={formData.link} 
                    onChange={handleInputChange} 
                    placeholder="e.g. /shop/summer"
                  />
                </div>
                
                <div className="form-group">
                  <label>Priority</label>
                  <input 
                    type="number" 
                    name="priority" 
                    value={formData.priority} 
                    onChange={handleInputChange} 
                    min="0"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn-submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Slide'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarouselManagement;
