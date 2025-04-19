import { useState, useRef } from 'react';
import { useClickOutside } from '../hooks/useClickOutside';
import { XMarkIcon } from '@heroicons/react/16/solid';

interface AvatarSelectorProps {
  currentAvatar: string;
  onSelect: (avatar: string) => void;
}

const avatars = [
  '/bear.png',
  '/cat.png',
  '/chicken.png',
  '/deer.png',
  '/dog.png',
  '/dragon.png',
  '/giraffe.png',
  '/koala.png',
  '/lion.png',
  '/meerkat.png',
  '/panda.png',
  '/puffer-fish.png',
  '/rabbit.png',
  '/sea-lion.png',
  '/sloth.png',
  '/weasel.png',
  '/wolf.png',
];

export default function AvatarSelector({ currentAvatar, onSelect }: AvatarSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  useClickOutside(popupRef, () => setIsOpen(false));

  const handleSelect = (avatar: string) => {
    onSelect(avatar);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={popupRef}>
      <div 
        className="relative group cursor-pointer w-fit"
        onClick={() => setIsOpen(!isOpen)}
      >
        <img 
          src={currentAvatar} 
          alt="Profile" 
          className="w-16 h-16 rounded-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <svg 
            className="w-6 h-6 text-white" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" 
            />
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" 
            />
          </svg>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-fit bg-white rounded-lg shadow-lg p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Select Avatar</h3>
            <span className="text-sm text-gray-500">
              <XMarkIcon className="w-6 h-6 cursor-pointer hover:text-gray-700" onClick={() => setIsOpen(false)} />
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-4 w-fit">
            {avatars.map((avatar) => (
              <div
                key={avatar}
                className={`relative cursor-pointer rounded-full overflow-hidden w-fit ${
                  currentAvatar === avatar ? 'ring-2 ring-green-500' : ''
                }`}
                title={avatar.split('/')[1].split('.')[0].replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}
                onClick={() => handleSelect(avatar)}
              >
                <img 
                  src={avatar} 
                  alt="Avatar option" 
                  className="w-14 h-14 object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 