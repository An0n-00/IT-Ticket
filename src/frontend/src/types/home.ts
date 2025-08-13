interface Feature {
    icon: React.ReactNode;
    title: string;
    description: string;
}

export interface FeatureCardsProps {
    features: Feature[];
}
