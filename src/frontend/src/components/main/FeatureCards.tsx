import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { FeatureCardsProps } from '@/types/home.ts';

export default function FeatureCards({ features }: FeatureCardsProps) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    return (
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3" onMouseLeave={() => setHoveredIndex(null)}>
            {features.map((feature, index) => (
                <Card
                    key={index}
                    className={`border transition-all duration-300 md:border-2 ${
                        hoveredIndex === null
                            ? 'border-muted'
                            : hoveredIndex === index
                              ? 'border-primary'
                              : hoveredIndex < index
                                ? 'border-primary/30'
                                : hoveredIndex > index
                                  ? 'border-primary/30'
                                  : 'border-muted'
                    }`}
                    onMouseEnter={() => setHoveredIndex(index)}
                >
                    <CardHeader className="p-4 md:p-6">
                        <div className="mb-2 flex">{feature.icon}</div>
                        <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                            {feature.title}
                            {feature.title === 'SLA Compliance' && (
                                <Badge variant="secondary" className="ml-2 text-xs">
                                    Coming soon
                                </Badge>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
                        <p className="text-muted-foreground text-sm md:text-base">{feature.description}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
