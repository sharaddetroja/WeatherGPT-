import { Card, CardContent } from './Card';
import { cn } from '../utils/cn';
import { motion } from 'motion/react';

interface WeatherStatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  unit: string;
  description?: string;
  className?: string;
  index?: number;
}

export function WeatherStatCard({ icon: Icon, label, value, unit, description, className, index = 0 }: WeatherStatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      whileHover={{ 
        y: -5, 
        scale: 1.025, 
        transition: { type: 'spring', stiffness: 400, damping: 17 } 
      }}
      className="h-full"
    >
      <Card className={cn("h-full hover:border-primary/50 hover:shadow-lg transition-all duration-300 backdrop-blur-xs bg-card/90", className)}>
        <CardContent className="p-4 md:p-6 flex items-center gap-4">
          <motion.div 
            whileHover={{ rotate: 12, scale: 1.15 }}
            className="p-3 bg-primary/10 text-primary rounded-2xl shadow-2xs flex-shrink-0"
          >
            <Icon className="w-6 h-6" />
          </motion.div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <h4 className="text-2xl font-extrabold tracking-tight text-foreground">{value}</h4>
              <span className="text-xs font-bold text-muted-foreground">{unit}</span>
            </div>
            {description && <p className="text-[11px] text-muted-foreground mt-1 line-clamp-1">{description}</p>}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
