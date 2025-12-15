
    private triggerLevelUp() {
        this.gameState.isPaused = true;
        // Correctly passing activeSkills array to enable level/evolution checks in ItemSystem
        const options = generateRewards(this.gameState.level, this.gameState.activeSkills);
        this.callbacks.onLevelUp(options);
    }
