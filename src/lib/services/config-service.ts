import { createClient } from "@/lib/supabase/client";

export type SiteConfig = {
    id: string;
    location: string;
    attractions: string;
    rules: string;
    whatsapp_link: string;
    hero_title?: string;
    hero_description?: string;
    event_date?: string;
    primary_color?: string;
    secondary_color?: string;
};

const supabase = createClient();

export const configService = {
    async getConfig() {
        const { data, error } = await supabase
            .from('site_config')
            .select('*')
            .single();
        if (error) {
            console.error('Error fetching site config:', error);
            return null;
        }
        return data as SiteConfig;
    },
    async updateConfig(id: string, updates: Partial<SiteConfig>) {
        const { data, error } = await supabase
            .from('site_config')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error) {
            console.error('Error updating site config:', error);
            throw error;
        }
        return data as SiteConfig;
    }
};
