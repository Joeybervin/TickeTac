
/* Pour afficher mon pop-up au clique */
document.addEventListener("DOMContentLoaded", function() {
  var btn = document.getElementById("myBtn");

  btn.addEventListener("click", function() {
      var myModal = new bootstrap.Modal(document.getElementById("myModal"));
      myModal.show();
  });
});