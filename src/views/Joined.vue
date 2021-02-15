<template>
    <div id="controls">
        <label for="control_brightness">
            Brightness
        </label>
        <input type="slider" name="brightness" id="brightness">        
        <div id="controls_disabled">
            <p>Disable effects</p>
            <label for="controls_effect_lightning">
                Lightning
                <input type="checkbox" name="controls_effect_lightning" id="controls_effect_lightning">
            </label>
            <label for="controls_effect_strobe">
                Strobe
                <input type="checkbox" name="controls_effect_strobe" id="controls_effect_strobe">
            </label>
            <label for="controls_effect_strobe_mega">
                Strobe Mega
                <input type="checkbox" name="controls_effect_strobe_mega" id="controls_effect_strobe_mega">
            </label>
        </div>
        <button type="button" id="control_leave_channel">Leave Channel</button>
    </div>
</template>
<script>
export default {
    
}
</script>