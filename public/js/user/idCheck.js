idCheckBtn.addEventListener('click', () => {
    const userid = document.querySelector('#userid');
    const idSpan = document.querySelector('#id_span');
  
    const reqJson = new Object();
    reqJson.userid = userid.value;
  
    const xmlhttp = new XMLHttpRequest();
    xmlhttp.open('POST', 'http://localhost:3001/user/join/idCheck', true);
    xmlhttp.setRequestHeader('content-type', 'application/json');
    xmlhttp.send(JSON.stringify(reqJson));
  
    if (userid.value === '') {
      userid.style.background = 'pink';
      idSpan.innerHTML = '아이디를 입력 해주세요.';
      idPass = false;
      isIdCheck = false;
      btnActive();
  
      return;
    }
  
    const checkspecial = (str) => {
      const regExp = /^[a-zA-Z0-9]+$/;
      if (regExp.test(str)) {
        return false;
      } else {
        return true;
      }
    };

    if (checkspecial(userid.value)) {
      userid.style.background = 'pink';
      idSpan.innerHTML = '특수문자 안됩니다~';
      idPass = false;
      btnActive();
      return;
    }

    xmlhttp.onreadystatechange = () => {
      if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
        if (xmlhttp.response === 'true') {
          idSpan.classList.add('green');
          idSpan.innerHTML = '사용할 수 있는 ID입니다.';
        } else {
          idSpan.classList.remove('green');
          idSpan.innerHTML = '사용할 수 없는 ID입니다.';
        }
      } else {
        console.log('연결에러');
      }
    };
  });
  