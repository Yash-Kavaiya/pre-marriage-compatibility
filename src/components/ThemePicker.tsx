import { Check, Monitor, Moon, Palette, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useTheme } from '@/hooks/use-theme';
import { Mode, palettes } from '@/lib/theme';
import { cn } from '@/lib/utils';

const modes: { id: Mode; label: string; icon: typeof Sun }[] = [
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'dark', label: 'Dark', icon: Moon },
  { id: 'system', label: 'Auto', icon: Monitor },
];

const ThemePicker = () => {
  const { palette, mode, dark, setTheme } = useTheme();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Change colour theme" className="relative">
          <Palette className="h-[1.15rem] w-[1.15rem]" />
          <span className="absolute bottom-1.5 right-1.5 h-2 w-2 rounded-full bg-accent ring-2 ring-background" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="border-b border-border p-4">
          <p className="font-display text-xl font-semibold text-primary">Make it yours</p>
          <p className="text-xs text-muted-foreground">Pick a palette that feels like the two of you.</p>
        </div>

        <div className="space-y-1 p-2" role="radiogroup" aria-label="Colour palette">
          {palettes.map((p) => {
            const selected = p.id === palette;
            return (
              <button
                key={p.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setTheme({ palette: p.id })}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors',
                  selected ? 'bg-primary-soft' : 'hover:bg-muted',
                )}
              >
                <span className="relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full ring-1 ring-border">
                  <span className="h-full w-1/2" style={{ background: p.swatch[0] }} />
                  <span className="h-full w-1/2" style={{ background: p.swatch[1] }} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">{p.name}</span>
                  <span className="block text-xs text-muted-foreground">{p.mood}</span>
                </span>
                {selected && <Check className="h-4 w-4 text-primary" />}
              </button>
            );
          })}
        </div>

        <div className="border-t border-border p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Appearance</p>
          <div className="grid grid-cols-3 gap-1 rounded-lg bg-muted p-1" role="radiogroup" aria-label="Appearance">
            {modes.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={mode === id}
                onClick={() => setTheme({ mode: id })}
                className={cn(
                  'flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition-colors',
                  mode === id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon className="h-3.5 w-3.5" /> {label}
              </button>
            ))}
          </div>
          {mode === 'system' && (
            <p className="mt-2 text-xs text-muted-foreground">Following your device: {dark ? 'dark' : 'light'}.</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ThemePicker;
