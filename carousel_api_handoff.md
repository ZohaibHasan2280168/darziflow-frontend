# Carousel API Handoff

This document provides the necessary API details to implement the Carousel feature in the React Web App.

## Base Path
`/api/carousel`

---

## 1. Get All Active Carousel Items
Fetch all active carousel items to display in the UI. Items are automatically sorted by `priority` (highest first) and `createdAt` (newest first).

- **Method**: `GET`
- **Endpoint**: `/api/carousel`
- **Access**: Public
- **Headers**: None required.

### Successful Response (200 OK)
```json
[
  {
    "_id": "64abcdef1234567890abcdef",
    "imageUrl": "https://res.cloudinary.com/demo/image/upload/v1234/sample.jpg",
    "publicId": "sample",
    "title": "Summer Sale",
    "description": "Get up to 50% off on all summer collections.",
    "link": "/shop/summer-sale",
    "isActive": true,
    "priority": 1,
    "createdAt": "2023-10-25T10:00:00.000Z",
    "updatedAt": "2023-10-25T10:00:00.000Z"
  }
]
```

---

## 2. Add New Carousel Item
Add a new item to the carousel. You must upload the image to Cloudinary (or your storage provider) first to obtain the `imageUrl` and `publicId`.

- **Method**: `POST`
- **Endpoint**: `/api/carousel`
- **Access**: Private / Admin
- **Headers**: `Authorization: Bearer <token>`

### Request Body
```json
{
  "imageUrl": "https://... (Required)",
  "publicId": "cloudinary_public_id (Required)",
  "title": "New Arrival (Required)",
  "description": "Check out our latest arrivals. (Optional)",
  "link": "/category/new (Optional)",
  "priority": 0 // (Optional, defaults to 0)
}
```

### Successful Response (201 Created)
Returns the created carousel object.

### Error Responses
- **400 Bad Request**: If `imageUrl`, `publicId`, or `title` are missing.
- **401 Unauthorized**: If no valid admin token is provided.

---

## 3. Delete Carousel Item
Delete a carousel item by its `_id`. This will also automatically delete the corresponding image from Cloudinary using the `publicId`.

- **Method**: `DELETE`
- **Endpoint**: `/api/carousel/:id`
- **Access**: Private / Admin
- **Headers**: `Authorization: Bearer <token>`

### Successful Response (200 OK)
```json
{
  "message": "Carousel item removed"
}
```

### Error Responses
- **404 Not Found**: If the carousel item does not exist.

---

## 💻 React Implementation Example

Here is a quick example of how you might fetch the carousel data in a React component using `axios`:

```jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const HeroCarousel = () => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCarouselItems = async () => {
      try {
        const { data } = await axios.get('/api/carousel');
        setSlides(data);
      } catch (error) {
        console.error('Error fetching carousel data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCarouselItems();
  }, []);

  if (loading) return <div>Loading carousel...</div>;

  return (
    <div className="carousel-container">
      {slides.map((slide) => (
        <div key={slide._id} className="carousel-slide">
          <a href={slide.link || '#'}>
            <img src={slide.imageUrl} alt={slide.title} />
            <div className="carousel-caption">
              <h3>{slide.title}</h3>
              {slide.description && <p>{slide.description}</p>}
            </div>
          </a>
        </div>
      ))}
    </div>
  );
};

export default HeroCarousel;
```
