'use client';

import { createFilament, FilamentFormState } from '@/app/lib/filament-actions';
import { useToast } from '@/hooks/use-toast';
import { useActionState, useEffect } from 'react';

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
 
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
 
const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
})

const initialState:FilamentFormState = {message: null};

export default function FilamentCreateForm({ redirectAfterCreate = true, path, onSuccess }: { redirectAfterCreate?: boolean, path?: string, onSuccess?: ()=>void }) {
    const createFilamentWithRedirect = createFilament.bind(null, { redirect: redirectAfterCreate, path: path });
    
    const [state, formAction, isPending] = useActionState(createFilamentWithRedirect, initialState);

    const { toast } = useToast();
    
    useEffect(() => {
        if (state?.success) {
            onSuccess?.();  
        }
    },[state?.success, onSuccess, toast]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
          username: "",
        },
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                        <Input placeholder="shadcn" {...field} />
                    </FormControl>
                    <FormDescription>
                        This is your public display name.
                    </FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <Button type="submit">Submit</Button>
            </form>
        </Form>
    );
}
