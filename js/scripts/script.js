/* Вопрос 1: в Api метод getInitialCards, можно ли вывести полученную data в глобальную область или так и работать?
  Вопрос 2: ниже есть функция добавления карточки, на страницу, я правильно понял что ее не надо никуда 
  запихивать в массив со всеми объектами, а она автоматически добавляется?
  Вопрос 3: в тз говорится, что для удобства удаления, сделать кнопку удаления постоянно активной, чтобы показывались только
  добавленные мной карточки, но при выполнении этого действия, кнопка появляется у всех карточек
  Вопрос 4: при удалении не понял как вычленять тот самый id который нам нужен */





/* Классы */

class Card {
  constructor(name, link) {
    this.cardElement = this.create(name, link);
    this.like = this.like.bind(this);
    this.remove = this.remove.bind(this);
    this.cardElement.querySelector('.place-card__like-icon').addEventListener('click', this.like);
    this.cardElement.querySelector('.place-card__delete-icon').addEventListener('click', this.remove);
    this.cardElement.querySelector('.open').addEventListener('click', ()=> {openImagePopup.open(event)});
  }

  like(event) {
    event.target.classList.toggle('place-card__like-icon_liked');
  }

  remove(event) {
      const card = event.target.parentNode.parentNode;
      card.parentNode.removeChild(card);
  }

  create(nameValue, linkValue) {
    const placeCard = document.createElement('div');
    placeCard.classList.add('place-card');
    const placeCardImage = document.createElement('div');
    placeCardImage.classList.add('place-card__image');
    const image = document.createElement('img');
    image.classList.add('place-card__image');
    image.classList.add('open');
    image.setAttribute('src', `${linkValue}`);
    const deleteButton = document.createElement('button');
    deleteButton.classList.add('place-card__delete-icon');
    const placeDescription = document.createElement('div');
    placeDescription.classList.add('place-card__description');
    const placeTitle = document.createElement('h3');
    placeTitle.classList.add('place-card__name');
    placeTitle.textContent = nameValue;
    const likeButton = document.createElement('button');
    likeButton.classList.add('place-card__like-icon');
    
    placeCardImage.appendChild(image);
    placeCardImage.appendChild(deleteButton);
    placeDescription.appendChild(placeTitle);
    placeDescription.appendChild(likeButton);
    placeCard.appendChild(placeCardImage);
    placeCard.appendChild(placeDescription);
  
    return placeCard;
  }
}

class Cardlist {
  constructor(container, array) {
    this.container = container;
    this.cardList = array;
    this.render();
  }

  addCard(name, link) {
    const { cardElement } = new Card(name, link);

    this.container.appendChild(cardElement);
  }

  render() {
    this.cardList.forEach(element => {
      this.addCard(element.name, element.link);
    });
  }
}

class Popup {
  constructor(popupElement) {
    this.element = popupElement;
  }
  open() {
    this.element.classList.add('popup_is-opened'); 
  }
  close() {
    this.element.classList.remove('popup_is-opened');
  }
}

class AddCardPopup extends Popup {
  open() {
    super.open();
    const errorName = createForm.querySelector('#spanName');
    const errorLink = createForm.querySelector('#spanLink');
    
    errorName.classList.remove('popup__input_error-visible');
    errorLink.classList.remove('popup__input_error-visible');
    
    if (createForm.elements.name.value.length === 0 || createForm.elements.link.value.length === 0) {
      popupAddButton.setAttribute('disabled', true);
      popupAddButton.classList.add('popup__button_disabled');
    } else {
      popupAddButton.removeAttribute('disabled');
      popupAddButton.classList.remove('popup__button_disabled');
    }
  }

  close(){
    super.close();
    createForm.reset();
  }
}

class EditInfoPopup extends Popup {
  open() {
    super.open();
    const userName = document.querySelector('.user-info__name').textContent;
    const userAbout = document.querySelector('.user-info__job').textContent;
    const errorName = selfForm.querySelector('#spanName');
    const errorAbout = selfForm.querySelector('#spanAbout');
    
    errorName.classList.remove('popup__input_error-visible');
    errorAbout.classList.remove('popup__input_error-visible');
    
    selfForm.elements.name.value = userName;
    selfForm.elements.about.value = userAbout;
    
    if (selfForm.elements.name.value.length === 0 || selfForm.elements.about.value.length === 0) {
      editSaveButton.setAttribute('disabled', true);
      editSaveButton.classList.add('popup__button_disabled');
    } else {
      editSaveButton.removeAttribute('disabled');
      editSaveButton.classList.remove('popup__button_disabled');
    }
  }
}

class ImagePopup extends Popup {
  open(event) {
    super.open();
    const image = popupImage.querySelector('.popup__image');
    image.setAttribute('src', `${event.target.getAttribute('src')}`);
  }
}

class Api {
  constructor(options) {
    this.api = options;
    this.getInfoAboutSelf();
    this.getInitialCards();
  }

  getInfoAboutSelf() {
    fetch(`${this.api.baseUrl}/users/me`, { 
      headers: this.api.headers
    })    
      .then(res => {
        if (res.ok) {
          return res.json();
        }
        return Promise.reject(`Ошибка: ${res.status}`);
      })
      .then(result => {
        console.log(result);
        userNameElement.textContent = result.name;
        userAboutElement.textContent = result.about;
        userAvatarElement.setAttribute('style', `background-image: url(${result.avatar})`);
    })
      .catch(err => {
        console.log(err);
      });
  }

  getInitialCards() {
    fetch(`${this.api.baseUrl}/cards`, {
      headers: this.api.headers
    })
      .then(res => {
        if (res.ok) {
          return res.json();
        }
        return Promise.reject(`Ошибка: ${res.status}`);
      })
      .then((data) => {
        new Cardlist(document.querySelector('.places-list'), data);
        console.log(data);
    })
      .catch(err => {
        console.log(err);
      });
  }

  editInfoAboutSelf(newInfo) {
    return fetch(`${this.api.baseUrl}/users/me`, {
      method: 'PATCH',
      headers: this.api.headers,
      body: JSON.stringify({
          name: newInfo.name,
          about: newInfo.about
      })
    })
      .then(res => {
        if (res.ok) {
          return res.json();
        }
        return Promise.reject(`Ошибка: ${res.status}`);
      })
      .then((data) => {
        const name = document.querySelector('.user-info__name');
        const about = document.querySelector('.user-info__job');
  
        name.textContent = selfForm.name.value;
        about.textContent = selfForm.about.value;
        console.log(data);
      })
      .catch(err => {
        console.log(err);
      });
  
  }


}

/* Переменные */

const initialCards = [];

const popupAdd = document.querySelector('#popup-add');
const addCardPopup = new AddCardPopup(popupAdd);
const popupAddOpenButton = document.querySelector('.user-info__button');
const popupAddCloseButton = popupAdd.querySelector('.popup__close');
const popupAddButton = popupAdd.querySelector('.popup__button');

const popupEdit = document.querySelector('#popup-edit');
const editInfoPopup = new EditInfoPopup(popupEdit);
const popupEditOpenButton = document.querySelector('.user-button__edit');
const popupEditCloseButton = popupEdit.querySelector('.popup__close');
const editSaveButton = popupEdit.querySelector('.popup__button');

const popupImage = document.querySelector('#popup-image');
const openImagePopup = new ImagePopup(popupImage);
const popupImageCloseButton = popupImage.querySelector('.popup__close');

const createForm = document.forms.new;
const selfForm = document.forms.self;


const userNameElement = document.querySelector('.user-info__name');
const userAboutElement = document.querySelector('.user-info__job');
const userAvatarElement = document.querySelector('.user-info__photo');


const api = new Api({
  baseUrl: 'http://95.216.175.5/cohort2',
  headers: {
    authorization: '11c39413-36e2-46e6-97d4-5aee37cd6c1d',
    'Content-Type': 'application/json'
  }
});







fetch('http://95.216.175.5/cohort2/cards', { 
  headers: {
  authorization: '11c39413-36e2-46e6-97d4-5aee37cd6c1d'
}
})    
  .then(res => res.json())
  .then(result => {
    console.log(result[94])
});





function addCar(newCard) {

  return fetch('http://95.216.175.5/cohort2/cards' , {
    method: 'POST',
    headers: {
      authorization: '11c39413-36e2-46e6-97d4-5aee37cd6c1d',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: newCard.name,
      link: newCard.link
    })
  })
    .then(res => res.json())
    .then((data) => {
      console.log(data);
    })

}


function deleteCard(id) {

  return fetch(`http://95.216.175.5/cohort2/cards/${id}` , {
    method: 'DELETE',
    headers: {
      authorization: '11c39413-36e2-46e6-97d4-5aee37cd6c1d',
      'Content-Type': 'application/json'
    }
  })
    .then(res => res.json())
    .then((data) => {
      console.log(data);
    })

}


function renderLoading(isLoading) {
  if(isLoading) {
    editSaveButton.textContent = 'Загрузка...';
  } else {
    popupEdit.classList.remove('popup_is-opened');
    editSaveButton.textContent = 'Сохранить';
  }
}

function renderLoadingToAdd(isLoading) {
  if(isLoading) {
    popupAddButton.textContent = 'Загрузка...';
  } else {
    createForm.reset();
    popupAdd.classList.remove('popup_is-opened');
    popupAddButton.textContent = 'Сохранить';
  }
}



/* Функции */

function validateNameIf() {
  const form = event.currentTarget;
  const name = form.elements.name;
  const error = form.querySelector('#spanName');
  const button = form.querySelector('.popup__button');

  error.classList.add('popup__input_error-visible');
  name.setAttribute('style', 'margin-bottom: 4px;');
  button.setAttribute('disabled', true);
  button.classList.add('popup__button_disabled');
}

function validateName(event) {
  const form = event.currentTarget;
  const name = form.elements.name;
  const error = form.querySelector('#spanName');

  if ((name.validity.tooShort) || (name.validity.tooLong)) {
    validateNameIf();
    error.textContent = 'Должно быть от 2 до 30 символов';
  } else if (name.validity.valueMissing) {
    validateNameIf();
    error.textContent = 'Это обязательное поле';
  } else {
    error.classList.remove('popup__input_error-visible');
    name.removeAttribute('style', 'margin-bottom: 4px;');
  }
}

function validateAboutIf() {
  const form = event.currentTarget;
  const error = form.querySelector('#spanAbout');
  const button = form.querySelector('.popup__button');

  error.classList.add('popup__input_error-visible');
  button.setAttribute('style', 'margin-top: 28px;');
  button.setAttribute('disabled', true);
  button.classList.add('popup__button_disabled');
}

function validateAbout(event) {
  const form = event.currentTarget;
  const about = form.elements.about;
  const error = form.querySelector('#spanAbout');
  const button = form.querySelector('.popup__button');

  if ((about.validity.tooShort) || (about.validity.tooLong)) {
    validateAboutIf();
    error.textContent = 'Должно быть от 2 до 30 символов';
  } else if (about.validity.valueMissing) {
    validateAboutIf();
    error.textContent = 'Это обязательное поле';
  } else {
    error.classList.remove('popup__input_error-visible');
    button.setAttribute('style', 'margin-top: 48px;');
  }
}

function validateLinkIf() {
  const form = document.forms.new;
  const error = form.querySelector('#spanLink');
  const button = form.querySelector('.popup__button');

  error.classList.add('popup__input_error-visible');
  error.textContent = 'Здесь должна быть ссылка';
  button.setAttribute('style', 'margin-top: 28px;');
  button.setAttribute('disabled', true);
  button.classList.add('popup__button_disabled');
}

function validateLink() {
  const form = document.forms.new;
  const link = form.elements.link;
  const error = form.querySelector('#spanLink');
  const button = form.querySelector('.popup__button');
  if (link.validity.typeMismatch) {
    validateLinkIf();
    error.textContent = 'Здесь должна быть ссылка';
  } else if (link.validity.valueMissing) {
    validateLinkIf();
    error.textContent = 'Это обязательное поле';
  } else {
    error.classList.remove('popup__input_error-visible');
    button.setAttribute('style', 'margin-top: 48px;');
  }
}


/* Слушатели событий */

createForm.addEventListener('input', function (event) {
  const form = event.currentTarget;
  const name = form.elements.name;
  const link = form.elements.link;

  if (name.value.length === 0 || link.value.length === 0) {
    popupAddButton.setAttribute('disabled', true);
    popupAddButton.classList.add('popup__button_disabled');
  } else {
    popupAddButton.removeAttribute('disabled');
    popupAddButton.classList.remove('popup__button_disabled');
  }
});
selfForm.addEventListener('input', function (event) {
  const form = event.currentTarget;
  const name = form.elements.name;
  const about = form.elements.about;

  if (name.value.length === 0 || about.value.length === 0) {
    editSaveButton.setAttribute('disabled', true);
    editSaveButton.classList.add('popup__button_disabled');
  } else {
    editSaveButton.removeAttribute('disabled');
    editSaveButton.classList.remove('popup__button_disabled');
  }
});

createForm.addEventListener('input', validateLink);
createForm.addEventListener('input', validateName);
selfForm.addEventListener('input', validateName);
selfForm.addEventListener('input', validateAbout);

popupAddOpenButton.addEventListener('click', ()=>{addCardPopup.open()});
popupAddCloseButton.addEventListener('click', ()=>{addCardPopup.close()});
popupEditOpenButton.addEventListener('click', ()=>{editInfoPopup.open()});
popupEditCloseButton.addEventListener('click', ()=>{editInfoPopup.close()});
popupImageCloseButton.addEventListener('click', ()=>{openImagePopup.close()});

createForm.addEventListener('submit', function(event) {
  event.preventDefault();
  renderLoadingToAdd(true);

  const { name, link } = event.currentTarget.elements;

  addCar({
    name: name.value,
    link: link.value
  })
    .finally(() => {renderLoadingToAdd(false);});

  // createForm.reset();
  // popupAdd.classList.remove('popup_is-opened');
});

selfForm.addEventListener('submit', function(event) {
  event.preventDefault();
  renderLoading(true);

  const { name, about } = event.currentTarget.elements;

  api.editInfoAboutSelf({
    name: name.value,
    about: about.value 
  })
    .finally(() => {renderLoading(false);});

  // popupEdit.classList.remove('popup_is-opened');
});

/*
  Код стал выглядеть гораздо лучше, но нужно поправить ещё несколько замечаний описанных выше.
*/