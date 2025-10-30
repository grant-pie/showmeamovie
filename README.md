# Movie Browser

A modern, accessible single-page web application built with Nuxt 3 for browsing and discovering movies using The Movie Database (TMDB) API.

## Features

### Browse & Discover
- **Advanced Filtering**: Filter movies by genre, rating, year, language, and multiple sort options
- **Pagination**: Navigate through thousands of movies with an intuitive paginator
- **Movie Grid**: Responsive grid layout showcasing movie posters, ratings, and details
- **Detailed Movie Pages**: View comprehensive information including cast, crew, videos, and watch providers

### User Experience
- **URL State Management**: Filter selections and page numbers persist in the URL for easy sharing and bookmarking
- **Debounced Filtering**: Smooth, optimized filter changes prevent excessive API calls
- **Loading States**: Visual feedback during data fetching with spinners and skeleton screens
- **Error Handling**: Graceful error messages with retry functionality
- **Back to Top Button**: Quick navigation for long pages

### Accessibility
- **WCAG 2.1 AA Compliant**: Built with accessibility as a priority
- **Keyboard Navigation**: Full keyboard support for all interactive elements
- **Screen Reader Support**: ARIA labels, live regions, and semantic HTML
- **Skip Links**: Quick navigation to main content
- **Focus Management**: Enhanced focus indicators and logical focus flow
- **High Contrast Mode**: Support for users with visual impairments

### Movie Details Page
- **Hero Section**: Large backdrop image with movie poster
- **Movie Information**: Title, tagline, overview, runtime, release date, and budget
- **Ratings & Reviews**: Visual rating circle with vote counts
- **Cast & Crew**: Comprehensive cast list with character names and consolidated crew roles
- **Video Player**: Embedded YouTube trailer player with keyboard controls
- **Watch Providers**: Links to streaming services where the movie is available (US region)
- **Genres & Facts**: Movie genres, certification, language, and production details

## Tech Stack

- **Framework**: Nuxt 3
- **Runtime**: Vue 3 with Composition API
- **Styling**: Bootstrap 5 with custom CSS
- **Icons**: Bootstrap Icons & Nuxt Icon
- **API**: The Movie Database (TMDB) API v3
- **Image Optimization**: Lazy loading with blur-up effect

## Project Structure

```
├── pages/
│   ├── index.vue          # Home page with filtering and movie grid
│   └── movies/
│       └── _id_.vue       # Dynamic movie details page
├── components/
│   ├── Cast.vue           # Cast member card component
│   ├── MovieCard.vue      # Individual movie card
│   ├── MovieGrid.vue      # Grid layout for movies
│   ├── Paginator.vue      # Pagination component
│   ├── RatingCircle.vue   # Circular rating indicator
│   └── VideoPlayer.vue    # YouTube video player modal
└── assets/
    ├── No-Image-Placeholder.png
    └── Image-Loading-Placeholder.png
```

## Setup

### Prerequisites
- Node.js 16.x or higher
- npm or yarn package manager
- TMDB API Key (Bearer Token)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd movie-browser
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory and add your TMDB API key:
```env
NUXT_PUBLIC_API_KEY=your_tmdb_bearer_token_here
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open your browser and navigate to `http://localhost:3000`

## Configuration

### TMDB API
The application uses TMDB API v3. You can obtain a free API key by:
1. Creating an account at [TMDB](https://www.themoviedb.org/)
2. Navigating to Settings → API
3. Requesting an API key (choose "Developer" option)
4. Use the "API Read Access Token" (Bearer Token) in your `.env` file

### Runtime Configuration
The API key is accessed via Nuxt's runtime config:
```javascript
const apiKey = useRuntimeConfig().public.apiKey
```

## API Endpoints Used

- `GET /discover/movie` - Browse movies with filters
- `GET /genre/movie/list` - Fetch movie genres
- `GET /configuration/languages` - Get available languages
- `GET /movie/{id}` - Get movie details
- `GET /movie/{id}/credits` - Get cast and crew
- `GET /movie/{id}/watch/providers` - Get streaming availability
- `GET /movie/{id}/videos` - Get trailers and videos

## Key Features Implementation

### Filter Persistence
Filters are synchronized with URL query parameters, allowing users to:
- Share specific movie searches via URL
- Bookmark filtered results
- Use browser back/forward navigation

### Dynamic Meta Tags
SEO-optimized meta tags are generated based on active filters:
- Page titles reflect current filters and page number
- Meta descriptions provide context about displayed movies
- Canonical URLs prevent duplicate content issues

### Image Optimization
- Lazy loading for all images
- Blur-up effect during image loading
- Fallback placeholder images for missing posters
- Responsive image sizing from TMDB CDN

### Error Recovery
- Automatic retry for failed API requests
- User-friendly error messages
- Graceful fallbacks for missing data

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Optimizations

- Debounced filter updates (300ms)
- Lazy loading for images
- Efficient API request batching
- Client-side caching of genres and languages
- Minimal re-renders with Vue 3 reactivity

## Accessibility Features

- Semantic HTML5 elements
- ARIA labels and descriptions
- Keyboard navigation support
- Screen reader announcements for dynamic content
- Focus trapping in modals
- Skip navigation links
- Color contrast ratios meeting WCAG AA standards
- Reduced motion support

## Development

### Build for Production
```bash
npm run build
# or
yarn build
```

### Preview Production Build
```bash
npm run preview
# or
yarn preview
```

### Generate Static Site
```bash
npm run generate
# or
yarn generate
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Acknowledgments

- Movie data provided by [The Movie Database (TMDB)](https://www.themoviedb.org/)
- Icons from [Bootstrap Icons](https://icons.getbootstrap.com/)
- Built with [Nuxt 3](https://nuxt.com/)

## Disclaimer

This application uses the TMDB API but is not endorsed or certified by TMDB.
