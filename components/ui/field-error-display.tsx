export default function FieldErrorDisplay({id, errors} : {id: string, errors?: string[]}) {
    return (
        <div id={id} aria-live="polite" aria-atomic="true">
            {errors?.map((error) => (
                <p className="mt-2 text-sm text-red-500" key={error}>{error}</p>
            ))}
        </div>
    );
}