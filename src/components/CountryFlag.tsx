import React from 'react';
import { getCountryByCode } from '../data/locations';

interface CountryFlagProps {
  countryCode?: string;
  size?: 'sm' | 'md';
  className?: string;
}

function buildFlagSvg(code: string): string {
  const c = code.toUpperCase();

  switch (c) {
    case 'DZ':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40">
        <rect width="30" height="40" fill="#006233"/>
        <rect x="30" width="30" height="40" fill="#FFFFFF"/>
        <circle cx="30" cy="20" r="10" fill="#D21034"/>
        <circle cx="32.5" cy="20" r="8" fill="#FFFFFF"/>
        <path d="M32 20 l3.5 -1.1 -2.2 3 0 -3.8 2.2 3 z" fill="#D21034"/>
      </svg>`;
    case 'MA':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40">
        <rect width="60" height="40" fill="#C1272D"/>
        <polygon points="30,11 32.5,18.5 40.5,18.5 34,23 36.5,30.5 30,26 23.5,30.5 26,23 19.5,18.5 27.5,18.5" fill="none" stroke="#006233" stroke-width="2.2"/>
      </svg>`;
    case 'TN':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40">
        <rect width="60" height="40" fill="#E70013"/>
        <circle cx="30" cy="20" r="10.5" fill="#FFFFFF"/>
        <circle cx="30" cy="20" r="7.5" fill="#E70013"/>
        <circle cx="32" cy="20" r="6" fill="#FFFFFF"/>
        <polygon points="31.5,16 33,19 36,19 33.5,21 34.5,24 31.5,22 28.5,24 29.5,21 27,19 30,19" fill="#E70013"/>
      </svg>`;
    case 'EG':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40">
        <rect width="60" height="13.4" fill="#CE1126"/>
        <rect y="13.3" width="60" height="13.4" fill="#FFFFFF"/>
        <rect y="26.6" width="60" height="13.4" fill="#000000"/>
        <circle cx="30" cy="20" r="3.4" fill="#C09300"/>
      </svg>`;
    case 'SA':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40">
        <rect width="60" height="40" fill="#006C35"/>
        <rect x="16" y="14" width="28" height="4" rx="2" fill="#FFFFFF"/>
        <rect x="14" y="25" width="32" height="2.4" rx="1.2" fill="#FFFFFF"/>
      </svg>`;
    case 'AE':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40">
        <rect x="15" width="45" height="13.4" fill="#00732F"/>
        <rect x="15" y="13.3" width="45" height="13.4" fill="#FFFFFF"/>
        <rect x="15" y="26.6" width="45" height="13.4" fill="#000000"/>
        <rect width="15" height="40" fill="#FF0000"/>
      </svg>`;
    case 'PS':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40">
        <rect width="60" height="13.4" fill="#000000"/>
        <rect y="13.3" width="60" height="13.4" fill="#FFFFFF"/>
        <rect y="26.6" width="60" height="13.4" fill="#007A3D"/>
        <polygon points="0,0 24,20 0,40" fill="#CE1126"/>
      </svg>`;
    case 'JO':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40">
        <rect width="60" height="13.4" fill="#000000"/>
        <rect y="13.3" width="60" height="13.4" fill="#FFFFFF"/>
        <rect y="26.6" width="60" height="13.4" fill="#007A3D"/>
        <polygon points="0,0 25,20 0,40" fill="#CE1126"/>
        <circle cx="8" cy="20" r="2.2" fill="#FFFFFF"/>
      </svg>`;
    case 'QA':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40">
        <rect width="60" height="40" fill="#8D1B3D"/>
        <polygon points="0,0 18,0 22,5 18,10 22,15 18,20 22,25 18,30 22,35 18,40 0,40" fill="#FFFFFF"/>
      </svg>`;
    case 'KW':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40">
        <rect width="60" height="13.4" fill="#007A3D"/>
        <rect y="13.3" width="60" height="13.4" fill="#FFFFFF"/>
        <rect y="26.6" width="60" height="13.4" fill="#CE1126"/>
        <polygon points="0,0 16,13.3 16,26.6 0,40" fill="#000000"/>
      </svg>`;
    case 'IQ':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40">
        <rect width="60" height="13.4" fill="#CE1126"/>
        <rect y="13.3" width="60" height="13.4" fill="#FFFFFF"/>
        <rect y="26.6" width="60" height="13.4" fill="#000000"/>
        <rect x="20" y="18" width="20" height="4" rx="1" fill="#007A3D"/>
      </svg>`;
    case 'LY':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40">
        <rect width="60" height="11" fill="#E70013"/>
        <rect y="11" width="60" height="18" fill="#000000"/>
        <rect y="29" width="60" height="11" fill="#239E46"/>
        <circle cx="30" cy="20" r="5" fill="#FFFFFF"/>
        <circle cx="31.8" cy="20" r="4" fill="#000000"/>
      </svg>`;
    case 'FR':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40">
        <rect width="20" height="40" fill="#0055A4"/>
        <rect x="20" width="20" height="40" fill="#FFFFFF"/>
        <rect x="40" width="20" height="40" fill="#EF4135"/>
      </svg>`;
    case 'TR':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40">
        <rect width="60" height="40" fill="#E30A17"/>
        <circle cx="25" cy="20" r="9" fill="#FFFFFF"/>
        <circle cx="27.5" cy="20" r="7.2" fill="#E30A17"/>
        <polygon points="36,20 39,18 37.5,21.5 40,24 36.5,23" fill="#FFFFFF"/>
      </svg>`;
    case 'DE':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40">
        <rect width="60" height="13.4" fill="#000000"/>
        <rect y="13.3" width="60" height="13.4" fill="#DD0000"/>
        <rect y="26.6" width="60" height="13.4" fill="#FFCE00"/>
      </svg>`;
    case 'IT':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40">
        <rect width="20" height="40" fill="#009246"/>
        <rect x="20" width="20" height="40" fill="#FFFFFF"/>
        <rect x="40" width="20" height="40" fill="#CE2B37"/>
      </svg>`;
    case 'ES':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40">
        <rect width="60" height="10" fill="#AA151B"/>
        <rect y="10" width="60" height="20" fill="#F1BF00"/>
        <rect y="30" width="60" height="10" fill="#AA151B"/>
      </svg>`;
    case 'GB':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40">
        <rect width="60" height="40" fill="#012169"/>
        <path d="M0,0 L60,40 M60,0 L0,40" stroke="#FFFFFF" stroke-width="6"/>
        <path d="M0,0 L60,40 M60,0 L0,40" stroke="#C8102E" stroke-width="2.5"/>
        <path d="M30,0 V40 M0,20 H60" stroke="#FFFFFF" stroke-width="9"/>
        <path d="M30,0 V40 M0,20 H60" stroke="#C8102E" stroke-width="5"/>
      </svg>`;
    case 'US':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40">
        <rect width="60" height="40" fill="#B22234"/>
        <rect y="6" width="60" height="5" fill="#FFFFFF"/>
        <rect y="16" width="60" height="5" fill="#FFFFFF"/>
        <rect y="26" width="60" height="5" fill="#FFFFFF"/>
        <rect width="26" height="22" fill="#3C3B6E"/>
      </svg>`;
    case 'CA':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40">
        <rect width="15" height="40" fill="#FF0000"/>
        <rect x="15" width="30" height="40" fill="#FFFFFF"/>
        <rect x="45" width="15" height="40" fill="#FF0000"/>
        <polygon points="30,10 34,21 26,21" fill="#FF0000"/>
      </svg>`;
    default: {
      // Crisp generated flag emblem for any of the remaining 170+ countries
      const palettes = [
        ['#0F4C81', '#F59E0B', '#FFFFFF'],
        ['#047857', '#FFFFFF', '#111827'],
        ['#991B1B', '#FBBF24', '#FFFFFF'],
        ['#1E3A8A', '#DC2626', '#FFFFFF'],
      ];
      const idx =
        ((c.charCodeAt(0) || 65) + (c.charCodeAt(1) || 65)) % palettes.length;
      const [top, bottom, text] = palettes[idx];
      const safeCode = c.replace(/[^A-Z]/g, '').slice(0, 2) || 'GL';
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40">
        <rect width="60" height="20" fill="${top}"/>
        <rect y="20" width="60" height="20" fill="${bottom}"/>
        <rect x="16" y="9" width="28" height="22" rx="4" fill="#141518" fill-opacity="0.72"/>
        <text x="30" y="25" font-family="Arial,sans-serif" font-size="13" font-weight="bold" fill="${text}" text-anchor="middle">${safeCode}</text>
      </svg>`;
    }
  }
}

export const CountryFlag: React.FC<CountryFlagProps> = ({
  countryCode = 'DZ',
  size = 'sm',
  className = '',
}) => {
  const country = getCountryByCode(countryCode);
  const svg = buildFlagSvg(country.code);
  const src = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  const sizeClass = size === 'md' ? 'w-8 h-5' : 'w-6 h-4';

  return (
    <img
      src={src}
      alt={`علم ${country.nameAr}`}
      title={country.nameAr}
      referrerPolicy="no-referrer"
      className={`${sizeClass} rounded-sm object-cover border border-[#E6E2DA] shrink-0 ${className}`}
    />
  );
};
