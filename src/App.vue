<template>
  <div class="container">
    <div class="card">
      <div class="box red"></div>
      <div class="box blue"></div>
      <div class="box green"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
.container {
  display: flex;
  flex-direction: column;
  background-color: #1a1a2e;
  width: 100%;
  height: 100%;
}
.card {
  display: flex;
  flex-direction: row;
  background-color: #ffffff;
  border-radius: 20px;
  padding: 30px;
  height: 100%;
  width: 100%;
}
.box {
  width: 100px;
  height: 80px;
  border-radius: 10px;
  margin-right: 10px;
  align-self: center;
}
.red {
  background-color: #ff6b6b;
}
.blue {
  background-color: #4ecdc4;
}
.green {
  background-color: #45b7d1;
}
</style>