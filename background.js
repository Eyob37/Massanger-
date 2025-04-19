let backgroundImages = [
   "./image/form background.jpg",
   "./image/form background2.jpg",
   "./image/form background3.jpg"
   
];

let randomImage = backgroundImages[Math.floor(Math.random() * backgroundImages.length)];
document.body.style.backgroundImage = `url("${randomImage}")`;