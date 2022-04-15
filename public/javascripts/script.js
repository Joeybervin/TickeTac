
/* Pour afficher mon pop-up au clique */
document.addEventListener("DOMContentLoaded", function() {
  var btn = document.getElementById("myModal");

  btn.addEventListener("click", function() {
      var myModal = new bootstrap.Modal(document.getElementById("modalCenter"));
      myModal.show();
  });
});

/* Pour afficher le password au moment du sign-in
function myFunction() {
  var x = document.getElementById("myInputSI");
  if (x.type === "password") {
    x.type = "text";
  } else {
    x.type = "password";
  }
}*/


/* Pour afficher le mot de passe Sign-in et Sign-up*/
function myFunction(nameInput) {
  var x = document.getElementById(nameInput);
  if (x.type === "password") {
    x.type = "text";
  } else {
    x.type = "password";
  }
}

        
