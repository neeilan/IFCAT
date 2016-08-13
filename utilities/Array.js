module.exports = {
  shuffle : arrayShuffle,
  swap : arraySwap
}

function arrayShuffle (arr){
  /* Shuffles the elements in the provided array (returns new array if
  passed in an array of primitives ) */
  var arr = arr.slice();
  for (var i = 0; i < arr.length; i++){
    arr = arraySwap(arr, i, Math.floor(Math.random()*arr.length));
  }
  return arr;
}

function arraySwap(arr, i, j){
  /* Swaps the ith and jth elements in the provided array. (MUTATOR) */
  var temp = arr[i];
  arr[i] = arr[j];
  arr[j] = temp;
  return arr;
}
