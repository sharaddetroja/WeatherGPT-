import { Card, CardContent } from './Card';
import { cn } from '../utils/cn';

interface WeatherStatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  unit: string;
  description?: string;
  className?: string;
}

export function WeatherStatCard({ icon: Icon, label, value, unit, description, className }: WeatherStatCardProps) {
  return (
    <Card className={cn("hover:border-primary/50 transition-colors", className)}>
      <CardContent className="p-4 md:p-6 flex items-center gap-4">
        <div className="p-3 bg-primary/10 text-primary rounded-xl">
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <div className="flex items-baseline gap-1">
            <h4 className="text-2xl font-bold tracking-tight">{value}</h4>
            <span className="text-sm font-medium text-muted-foreground">{unit}</span>
          </div>
          {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
