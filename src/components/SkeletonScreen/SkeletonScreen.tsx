import * as S from './SkeletonScreen.styles';

export interface SkeletonScreenProps {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string;
  height?: string;
}

export function SkeletonScreen({ variant = 'text', width, height }: SkeletonScreenProps) {
  return (
    <S.Skeleton
      $variant={variant}
      $width={width}
      $height={height}
      data-testid="skeleton-screen"
    />
  );
}

export function WeatherCardSkeleton() {
  return (
    <S.CardContainer data-testid="weather-card-skeleton">
      <S.Header>
        <SkeletonScreen variant="text" width="60%" height="32px" />
        <SkeletonScreen variant="circular" width="40px" height="40px" />
      </S.Header>

      <S.Content>
        <SkeletonScreen variant="circular" width="80px" height="80px" />
        <SkeletonScreen variant="text" width="40%" height="48px" />
        <SkeletonScreen variant="text" width="60%" height="24px" />
      </S.Content>

      <S.Details>
        <SkeletonScreen variant="rectangular" width="100%" height="80px" />
      </S.Details>
    </S.CardContainer>
  );
}
