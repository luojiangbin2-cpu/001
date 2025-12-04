import { SpriteConfig } from './types';

export class AssetManager {
    private images: Map<string, HTMLImageElement> = new Map();
    private configs: Map<string, SpriteConfig> = new Map();

    constructor() {}

    /**
     * Preloads all images defined in the assets map.
     * @param assets Map of keys to SpriteConfigs (which contain the src)
     */
    async loadImages(assets: Record<string, SpriteConfig>): Promise<void> {
        const promises = Object.entries(assets).map(([key, config]) => {
            return new Promise<void>((resolve) => {
                const img = new Image();
                img.src = config.src;
                img.onload = () => {
                    this.images.set(key, img);
                    this.configs.set(key, config);
                    resolve();
                };
                img.onerror = (e) => {
                    console.error(`Failed to load asset: ${key}`, e);
                    // Resolve anyway to prevent game freeze, potentially use a placeholder in future
                    resolve();
                };
            });
        });
        await Promise.all(promises);
    }

    /**
     * Retrieves a loaded image by key.
     */
    get(key: string): HTMLImageElement | undefined {
        return this.images.get(key);
    }

    /**
     * Retrieves the sprite configuration for a key.
     */
    getConfig(key: string): SpriteConfig | undefined {
        return this.configs.get(key);
    }
}
