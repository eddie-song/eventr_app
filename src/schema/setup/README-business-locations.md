# Business Locations Feature

This document describes the business locations feature implementation in the Eventr application.

## Overview

The business locations feature allows users to create and manage business location listings with comprehensive information including contact details, amenities, reviews, and more.

## Database Schema

### Main Tables

#### `business_locations`
- **uuid**: Primary key
- **name**: Business name (required)
- **description**: Business description
- **address**: Street address (required)
- **city**: City (required)
- **state**: State/province
- **zip_code**: ZIP/postal code
- **country**: Country (default: 'USA')
- **longitude/latitude**: GPS coordinates
- **phone**: Phone number
- **email**: Email address
- **website**: Website URL
- **business_type**: Type of business (restaurant, retail, service, etc.)
- **hours_of_operation**: Operating hours
- **price_range**: Price range ($, $$, $$$, $$$$)
- **amenities**: Array of available amenities
- **image_url**: Business image URL
- **created_by**: User who created the listing
- **created_at/updated_at**: Timestamps

#### `business_location_tags`
Junction table for business location tags
- **business_location_id**: Foreign key to business_locations
- **tag**: Tag name
- **created_at**: Timestamp

#### `business_location_reviews`
Reviews for business locations
- **uuid**: Primary key
- **business_location_id**: Foreign key to business_locations
- **user_id**: Foreign key to profiles
- **rating**: Rating (1-5)
- **review_text**: Review content
- **created_at/updated_at**: Timestamps

## Storage

### `business-location-images` Bucket
- Private bucket for storing business location images
- 5MB file size limit
- Supports JPEG, PNG, WebP, GIF
- User-based folder structure: `{user_id}/{timestamp}.{extension}`

## Services

### `businessLocationService.js`
Provides the following methods:
- `createBusinessLocation()`: Create new business location
- `getBusinessLocation()`: Get business location by ID
- `getAllBusinessLocations()`: Get all business locations
- `searchBusinessLocations()`: Search with filters
- `updateBusinessLocation()`: Update existing location
- `deleteBusinessLocation()`: Delete location
- `addReview()`: Add review to location
- `getReviews()`: Get reviews for location
- `getBusinessLocationsByType()`: Filter by business type
- `getBusinessLocationsByCity()`: Filter by city

## Components

### `BusinessLocationForm.tsx`
TypeScript React component with:
- Comprehensive form with validation
- Image upload with preview
- Amenities selection
- Tags management
- Responsive design with Tailwind CSS
- Error handling and notifications

## Setup Instructions

1. **Run Database Migrations**:
   ```sql
   -- Run the business location table setup
   \i src/schema/setup/business-location-table.sql
   
   -- Run the storage bucket setup
   \i src/schema/setup/business-location-images-bucket.sql
   ```

2. **Update Image Upload Service**:
   The `imageUploadService.js` has been updated with business location image methods.

3. **Integration**:
   The business location form is integrated into the main create page as a new tab.

## Features

### Business Types
- General
- Restaurant
- Retail
- Service
- Entertainment
- Healthcare
- Fitness
- Beauty & Spa
- Professional Services
- Other

### Amenities
- Wi-Fi
- Parking
- Wheelchair Accessible
- Outdoor Seating
- Delivery
- Takeout
- Reservations
- Live Music
- Happy Hour
- Pet Friendly

### Price Ranges
- $ (Inexpensive)
- $$ (Moderate)
- $$$ (Expensive)
- $$$$ (Very Expensive)

## Security

- Row Level Security (RLS) enabled on all tables
- Users can only manage their own business locations
- Authenticated users can view all business locations
- Image uploads restricted to authenticated users
- File type and size validation

## Usage

1. Navigate to the Create page
2. Select "Business Locations" tab
3. Fill out the comprehensive form
4. Upload an image or provide image URL
5. Submit to create the business location

## Future Enhancements

- Business location search and filtering
- Business location discovery page
- Business location analytics
- Business owner dashboard
- Integration with maps and directions
- Business verification system 