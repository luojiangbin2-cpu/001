
import { SpriteConfig, SpriteState } from './types';

export class AssetManager {
    // Key is "entityKey_stateKey", e.g., "player_run"
    private images: Map<string, HTMLImageElement> = new Map();
    // Configs are stored by entity key, containing all states
    private configs: Map<string, SpriteConfig> = new Map();

    constructor() {}

    /**
     * Preloads all images defined in the assets map.
     * Handles nested states (idle, run, etc.).
     * @param assets Map of keys to SpriteConfigs
     */
    async loadImages(assets: Record<string, SpriteConfig>): Promise<void> {
        const promises: Promise<void>[] = [];

        for (const [entityKey, config] of Object.entries(assets)) {
            this.configs.set(entityKey, config);

            for (const [stateKey, stateConfig] of Object.entries(config.states)) {
                const compositeKey = `${entityKey}_${stateKey}`;
                const p = new Promise<void>((resolve) => {
                    const img = new Image();
                    img.src = stateConfig.src;
                    img.onload = () => {
                        this.images.set(compositeKey, img);
                        resolve();
                    };
                    img.onerror = (e) => {
                        console.error(`Failed to load asset: ${compositeKey}`, e);
                        // Resolve anyway to prevent game freeze
                        resolve();
                    };
                });
                promises.push(p);
            }
        }

        await Promise.all(promises);
    }

    /**
     * Retrieves a loaded image by entity key and state.
     * Falls back to default state if specific state not found.
     */
    get(key: string, state: string = 'idle'): HTMLImageElement | undefined {
        let img = this.images.get(`${key}_${state}`);
        if (!img) {
            const config = this.configs.get(key);
            if (config) {
                // Try default state
                img = this.images.get(`${key}_${config.defaultState}`);
            }
        }
        return img;
    }

    /**
     * Retrieves the sprite configuration for a specific state.
     */
    getConfig(key: string, state: string = 'idle'): SpriteState | undefined {
        const mainConfig = this.configs.get(key);
        if (!mainConfig) return undefined;

        let stateConfig = mainConfig.states[state];
        if (!stateConfig) {
            stateConfig = mainConfig.states[mainConfig.defaultState];
        }
        return stateConfig;
    }
}
