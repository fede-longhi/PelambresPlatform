import { Label } from "./label";
import { Input } from "./input";
import FieldErrorDisplay from "./field-error-display";

type FormProps = {
    name: string;
    label?: string;
}

export function InputForm({
    name,
    label
}:FormProps) {
    return (
        <div>
            <Label htmlFor={name}>{label}</Label>
            <Input id={name} name={name} aria-describedby={`${name}-error`}/>
            <FieldErrorDisplay errors={[""]} id={`${name}-error`} />
        </div>
    );
}