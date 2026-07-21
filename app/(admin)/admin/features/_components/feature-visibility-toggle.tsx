'use client';

import { useActionState, useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  updateFeatureVisibility,
  type FeatureVisibilityFormState,
} from '@/lib/actions/feature-flag-actions';

type FeatureVisibilityToggleProps = {
  featureKey: string;
  isEnabled: boolean;
};

const initialState: FeatureVisibilityFormState = {
  message: null,
  success: undefined,
};

export function FeatureVisibilityToggle({
  featureKey,
  isEnabled,
}: FeatureVisibilityToggleProps) {
  const action = updateFeatureVisibility.bind(null, featureKey);
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [enabled, setEnabled] = useState(isEnabled);

  const handleCheckedChange = (checked: boolean) => {
    setEnabled(checked);
    const formData = new FormData();
    formData.set('isEnabled', checked ? 'true' : 'false');
    formAction(formData);
  };

  return (
    <div className="space-y-3 rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <Label htmlFor={`feature-enabled-${featureKey}`} className="text-base">
            Visible para todos
          </Label>
          <p className="text-sm text-muted-foreground">
            Si está apagada, solo la ven administradores y usuarios de la lista de
            acceso.
          </p>
        </div>
        <Switch
          id={`feature-enabled-${featureKey}`}
          checked={enabled}
          disabled={isPending}
          onCheckedChange={handleCheckedChange}
        />
      </div>
      {state.message ? (
        <p
          className={`text-sm ${state.success ? 'text-emerald-700' : 'text-destructive'}`}
          aria-live="polite"
        >
          {state.message}
        </p>
      ) : null}
    </div>
  );
}
