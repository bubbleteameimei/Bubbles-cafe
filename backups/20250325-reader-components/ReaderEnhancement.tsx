import React, { ReactNode } from 'react';
import { DeviceType } from './ResponsiveReaderLayout';
import ResponsiveReaderLayout from './ResponsiveReaderLayout';
import ResponsiveReaderControls from './ResponsiveReaderControls';
import ResponsiveReaderHeader from './ResponsiveReaderHeader';

// This component will wrap the existing reader page components and provide responsive enhancements
interface ReaderEnhancementProps {
  children: ReactNode;
  title: string;
  date: string;
  readTime: string;
  views?: number;
  category?: string;
  authorName?: string;
  fontSizeValue: number;
  onIncreaseFontSize: () => void;
  onDecreaseFontSize: () => void;
  onShare?: () => void;
  onBookmark?: () => void;
  isBookmarked?: boolean;
  deviceType: DeviceType;
}

const ReaderEnhancement: React.FC<ReaderEnhancementProps> = ({
  children,
  title,
  date,
  readTime,
  views,
  category,
  authorName,
  fontSizeValue,
  onIncreaseFontSize,
  onDecreaseFontSize,
  onShare,
  onBookmark,
  isBookmarked,
  deviceType
}) => {
  return (
    <ResponsiveReaderLayout
      className="reader-enhancement"
      header={
        <ResponsiveReaderHeader
          title={title}
          date={date}
          readTime={readTime}
          views={views}
          category={category}
          deviceType={deviceType}
          authorName={authorName}
        />
      }
      controls={
        <ResponsiveReaderControls
          fontSizeValue={fontSizeValue}
          onIncreaseFontSize={onIncreaseFontSize}
          onDecreaseFontSize={onDecreaseFontSize}
          onShare={onShare}
          onBookmark={onBookmark}
          isBookmarked={isBookmarked}
          deviceType={deviceType}
        />
      }
    >
      {/* Pass through the original content */}
      {children}
    </ResponsiveReaderLayout>
  );
};

export default ReaderEnhancement;