export type LlmConfig = {
    apiKey: string;
    baseUrl: string;
    model: string;
};

export function getLlmConfig(): LlmConfig | null {
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) {
        return null;
    }

    return {
        apiKey,
        baseUrl: process.env.OPENAI_BASE_URL?.trim() || 'https://api.openai.com/v1',
        model: process.env.OPENAI_MODEL?.trim() || 'gpt-4o',
    };
}

export function getLlmUnavailableMessage(): string {
    return 'La generación con IA no está configurada. Agregá OPENAI_API_KEY en las variables de entorno.';
}

type ChatCompletionMessage = {
    role: 'system' | 'user' | 'assistant';
    content: string;
};

type ChatCompletionResponse = {
    choices?: Array<{
        message?: {
            content?: string | null;
        };
    }>;
    error?: {
        message?: string;
    };
};

export async function createChatCompletion(
    messages: ChatCompletionMessage[],
    options?: { jsonMode?: boolean },
): Promise<string> {
    const config = getLlmConfig();
    if (!config) {
        throw new Error(getLlmUnavailableMessage());
    }

    const response = await fetch(`${config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: config.model,
            messages,
            temperature: 0.4,
            ...(options?.jsonMode
                ? { response_format: { type: 'json_object' } }
                : {}),
        }),
    });

    const data = (await response.json()) as ChatCompletionResponse;

    if (!response.ok) {
        throw new Error(
            data.error?.message ||
                'No se pudo completar la solicitud al proveedor de IA.',
        );
    }

    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) {
        throw new Error('El proveedor de IA no devolvió contenido.');
    }

    return content;
}
