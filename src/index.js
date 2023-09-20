import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

Notiflix.Notify.init({
  position: 'center-top',
});

const API_URL = 'https://pixabay.com/api/?';
const API_KEY = '39544190-c7a34de0cf0fc54c64c975cab';

const input = document.querySelector('input[name="searchQuery"]');
const btn = document.querySelector('button[type="submit"]');
const gallery = document.querySelector('.gallery');
const loadMore = document.querySelector('.is-hidden');

loadMore.style.display = 'none';

let page = 1;

const searchApi = async () => {
  return await axios.get(API_URL, {
    params: {
      key: API_KEY,
      q: input.value,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: 'true',
      page: page,
      per_page: 40,
    },
  });
};

const loadApi = async () => {
  try {
    const response = await searchApi();

    if (response.data.hits.length > 0 && input.value !== '') {
      const numberImg = response.data.total;

      gallery.innerHTML = createGallery(response);
      loadMore.style.display = 'block';

      Notiflix.Notify.success(`Hooray! We found ${numberImg} images.`);
      let lightbox = new SimpleLightbox('.gallery a');
    } else {
      clear();
      loadMore.style.display = 'none';
      Notiflix.Notify.failure(
        `Sorry, there are no matching images. Please try again.`
      );
    }
  } catch (error) {
    console.error(error);
  }
};

btn.addEventListener('click', e => {
  e.preventDefault();
  loadApi(page = 1);
});

const clear = () => {
  gallery.innerHTML = '';
};

const createGallery = response => {
  return response.data.hits
    .map(img => {
      return `<div class="photo-card">
        <a href="${img.largeImageURL}">
        <img src="${img.webformatURL}" alt="${img.tags}" loading="lazy" /></a>
          <div class="info">
            <p class="info-item"><b>Likes</b></br>
              ${img.likes}
            </p>
            <p class="info-item"><b>Views</b></br>
              ${img.views}
            </p>
            <p class="info-item"><b>Comments</b></br>
              ${img.comments}
            </p>
            <p class="info-item"><b>Downloads</b></br>
              ${img.downloads}
            </p>
          </div>
        </div>`;
    })
    .join('');
};

const loadMoreApi = async () => {
  try {
    page++;
    const response = await searchApi();

    gallery.insertAdjacentHTML('beforeend', createGallery(response));
    gallery.addEventListener('click', e => e.preventDefault());
    let lightbox = new SimpleLightbox('.gallery a');
    lightbox.refresh();

    const { height: cardHeight } =
      gallery.firstElementChild.getBoundingClientRect();

    if (response.data.total / page < 40) {
      Notiflix.Notify.failure(
        `Sorry, you've reached the end of the search results.`
      );
    }
  } catch (error) {
    console.error(error);
  }
};

window.addEventListener('scroll', () => {
  if (
    window.scrollY + window.innerHeight >=
    document.documentElement.scrollHeight
  ) {
    loadMoreApi();
  }
});
