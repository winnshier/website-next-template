import { ImageResponse } from 'next/og';

// Image metadata
export const alt = 'Enterprise Website Template';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

// Image generation
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 'bold',
            marginBottom: 20,
            textAlign: 'center',
            maxWidth: '90%',
          }}
        >
          Enterprise Website Template
        </div>
        <div
          style={{
            fontSize: 32,
            opacity: 0.9,
            textAlign: 'center',
            maxWidth: '80%',
          }}
        >
          Next.js 14 • TypeScript • Tailwind CSS • Multi-language • SEO Optimized
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
