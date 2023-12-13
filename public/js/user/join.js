const inputList = document.querySelectorAll('input');
const userid = document.querySelector('#userid');
const idSpan = document.querySelector('#id_span');

const idCheckBtn = document.querySelector('#id_check_btn');

const userpw = document.querySelector('#userpw');
const userpwCheck = document.querySelector('#userpw_check');
const pwSpan = document.querySelector('#pw_span');
const pwChkSpan = document.querySelector('#pw_chk_span');

const userNickname = document.querySelector('#usernickname');
const nicknameSpan = document.querySelector('#nickname_span');

const joinBtn = document.querySelector('#btn_container');
const idCompare = [];

let isIdCheck = false;
let idPass = false;
let nicknamePass = false;
let pwPass = false;

const btnActive = () => {
  if (
    idPass &&
    nicknamePass &&
    pwPass
  ) {
    console.log('check');
    joinBtn.innerHTML = ` <button type="submit" class="join_btn" id="join_submit_btn">
                회원가입
              </button>`;
  } else {
    joinBtn.innerHTML = ` <div class="join_btn non_btn" id="join_submit_btn">
                양식이 지켜지지 않았습니다.
              </div>`;
  }
};

inputList.forEach((v) => {
  v.addEventListener('keydown', (e) => {
    if (e.keyCode === 32) {
      e.preventDefault();
      alert('공백은 입력이 불가능합니다.');
    }
  });
});

idCheckBtn.addEventListener('click', () => {
  isIdCheck = true;
  userid.style.background = '';
  idSpan.innerHTML = '';
  idPass = true;
  btnActive();
});

const checkspecial = (str) => {
  const regExp = /^[a-zA-Z0-9]+$/;
  if (regExp.test(str)) {
    return true;
  } else {
    return false;
  }
};

userid.addEventListener('blur', () => {
  idCompare.push(userid.value);

  if (idCompare[idCompare.length - 1] !== idCompare[idCompare.length - 2]) {
    isIdCheck = false;
  } else {
    isIdCheck = true;
  }

  if (isIdCheck === false) {
    userid.style.background = 'pink';
    idSpan.innerHTML = '아이디 중복체크를 해주세요.';
    idPass = false;
    btnActive();
    return;
  }

  userid.style.background = '';
  idSpan.innerHTML = '';
  idPass = true;
  btnActive();
});

userNickname.addEventListener('blur', () => {
  if (userNickname.value === '') {
    userNickname.style.background = 'pink';
    nicknameSpan.innerHTML = '닉네임을 입력해주세요.';
    nicknamePass = false;
  } else {
    userNickname.style.background = '';
    nicknameSpan.innerHTML = '';
    nicknamePass = true;
  }
  btnActive();
});

userpw.addEventListener('blur', () => {
  if (userpw.value === '') {
    userpw.style.background = 'pink';
    pwSpan.innerHTML = '비밀번호를 입력해주세요.';
    pwPass = false;
    btnActive();
    return;
  }

  if (userpw.value !== userpwCheck.value) {
    userpw.style.background = 'pink';
    userpwCheck.style.background = 'pink';
    pwChkSpan.innerHTML = '비밀번호가 일치하지 않습니다.';
    pwPass = false;
    btnActive();
    return;
  }

  userpw.style.background = '';
  pwSpan.innerHTML = '';
  pwPass = true;
  btnActive();
});

userpwCheck.addEventListener('blur', () => {
  if (userpw.value !== userpwCheck.value) {
    userpw.style.background = 'pink';
    userpwCheck.style.background = 'pink';
    pwChkSpan.innerHTML = '비밀번호가 일치하지 않습니다.';
    pwPass = false;
  } else {
    userpw.style.background = '';
    userpwCheck.style.background = '';
    pwChkSpan.innerHTML = '';
    pwPass = true;
  }
  btnActive();
});
