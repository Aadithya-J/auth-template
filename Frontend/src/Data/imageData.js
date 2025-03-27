import imageList from "./images.json";

const imageImports = {
  "yellow.jpg": new URL("../assets/yellow.jpg", import.meta.url).href,

  "apple.jpg": new URL("../assets/apple.jpg", import.meta.url).href,
  "cat.jpg": new URL("../assets/cat.jpg", import.meta.url).href,
  "deer.jpg": new URL("../assets/deer.jpg", import.meta.url).href, 
  "flower.jpg": new URL("../assets/flower.jpg", import.meta.url).href,
    
  "lion.jpg": new URL("../assets/lion.jpg", import.meta.url).href,
  "elephant.jpg": new URL("../assets/elephant.jpg", import.meta.url).href,
  "tiger.jpg": new URL("../assets/tiger.jpg", import.meta.url).href,
  "panda.jpg": new URL("../assets/panda.jpg", import.meta.url).href,
  "monkey.jpg": new URL("../assets/monkey.jpg", import.meta.url).href,
};

const images = imageList.map(img => ({
  ...img,
  imageUrl: imageImports[img.imageUrl] || ""
}));

export default images;
