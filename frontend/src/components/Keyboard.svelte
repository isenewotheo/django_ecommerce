<script>
    let keys = document.getElementsByClassName("key")[0];
    let arrKeys = [2 ,8 ,2];
    arrKeys.forEach(key => {
        console.log(key)
    });
    console.log(keys)
    function setActive(keypressed) {
    }
</script>

<div class="keyboard">
    <div class="row">
        <button class="key">q</button><button class="key">w</button><button class="key">e</button><button class="key">r</button><button class="key">t</button><button class="key">y</button><button class="key">u</button><button class="key">i</button><button class="key">o</button><button class="key">p</button>
    </div>
    <div class="row">
        <button class="key">a</button>
        <button class="key">s</button>
        <button class="key">d</button>
        <button class="key">f</button>
        <button class="key">g</button>
        <button class="key">h</button>
        <button class="key">j</button>
        <button class="key">k</button>
        <button class="key">l</button>
    </div>
    <div class="row">
        <button class="key active">z</button>
        <button class="key">x</button>
        <button class="key">c</button>
        <button class="key">v</button>
        <button class="key">b</button>
        <button class="key">n</button>
        <button class="key">m</button>
    </div>
    <div class="row">
        <button id="space" class="key"></button>
    </div>
</div>

<style>
    div.keyboard {
        background-color: rgb(245, 244, 244);
        height: 200px;
        width: 500px;
        border-radius: 20px;
        border: 2px solid rgb(90, 90, 90);
        padding: 10px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
    }
    .row {
        display: flex;
        justify-content: space-around;
    }
    .key {
        width: 35px;
        padding-top: 2px;
        height: 30px;
        border: 1px solid rgb(90, 90, 90);
        text-transform: uppercase;
        font-weight: 500;
    }
    .active {
        border: 2px solid black;
        font-weight: 700;
    }
    #space {
        width: 200px;
    }
</style>