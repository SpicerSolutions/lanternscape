<template>
    <div class="device_page">
        <div id="device_current">
            <label for="">Select Device</label>
            <select id="device" name="">
                <option>None</option>
            </select>
            <button type="button" id="device_delete">Delete</button>
        </div>
        <div id="device_new">
            <label for="device_address">
                IP address of DNS of the lantern
            </label>
            <input type="text" name="device_address" id="device_address">
            <button type="button" id="device_add">Add</button>
        </div>
    </div>
</template>

<script>
export default {
    
}
</script>