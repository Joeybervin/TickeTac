
/* Pour afficher mon pop-up au clique */
document.addEventListener("DOMContentLoaded", function() {
  var btn = document.getElementById("myModal");

  btn.addEventListener("click", function() {
      var myModal = new bootstrap.Modal(document.getElementById("modalCenter"));
      myModal.show();
  });
});

