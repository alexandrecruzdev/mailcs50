document.addEventListener('DOMContentLoaded', function () {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  // By default, load the inbox
  load_mailbox('inbox');


  send_form(document.querySelector("#compose-form"));
});

function compose_email(email) {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  if(typeof email.id == 'number')
  {
    from = document.querySelector("#from")
    to = document.querySelector("#compose-recipients");
    subject = document.querySelector("#compose-subject")
    body = document.querySelector("#compose-body")
    date = new Date();
    date = date.toDateString()

    to.disabled = true
    to.value = email.sender
    body.value=`${email.body}`+`
    
On ${date}, ${from.value} wrote:`

    if(email.subject.toUpperCase().search("RE:") == 0) 
    {
        //tem re
        subject.value = email.subject
        subject.disabled = true
        
    }
    else
    {
        //nao tem re
        subject.value = `Re:${email.subject}`
        subject.disabled = true

        
    }


    

  }
  else
  {
    to.disabled = false
    subject.disabled= false
    
  }

}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views


  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  //const emails_view = document.querySelector('#emails-view');
  //const h1 = document.createElement("h1");
  //let conteudo_h1 =  document.createTextNode("Conteudo h1!");
  //emails_view.append(h1)
  //h1.appendChild(conteudo_h1);
  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
      // Print emails
      print_emails(emails, mailbox);
      // ... do something else with emails ...
    });


}

function send_form(form) {

  const submit_button = document.querySelector("#submit_button");



  submit_button.addEventListener('click', (e) => {

    let to = document.querySelector("#compose-recipients").value
    let subject = document.querySelector("#compose-subject").value
    let body = document.querySelector("#compose-body").value

    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: to,
        subject: subject,
        body: body
      })
    })
      .then(response => response.json())
      .then(result => {
        // Print result
        console.log(result);
      });

    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';

  });


}

function print_emails(emails, mailbox) {
  let len = emails.length;
  let i;
  const emails_view = document.querySelector('#emails-view');
  const table = document.createElement('table');
  table.classList.add("table")


  for (i = 0; i < len; i++) {
    console.log(emails[i].sender)
    console.log(emails[i].subject)
    console.log(emails[i].timestamp)
    console.log(emails[i].read)
    console.log(emails[i].archived)


    const tr = document.createElement('tr');

    if (emails[i].read == true) {
      tr.style.backgroundColor = "rgb(215,215,215)";
    }
    else {
      tr.style.backgroundColor = "white";

    }

    const td1 = document.createElement('td');
    const td2 = document.createElement('td');
    const td3 = document.createElement('td');
    const td4 = document.createElement('td');

    let sender = document.createTextNode(`${emails[i].sender}`);
    let subject = document.createTextNode(`${emails[i].subject}`);
    let timestamp = document.createTextNode(`${emails[i].timestamp}`);
    let a = document.createElement("a");
    let id = emails[i].id;
    a.addEventListener('click', (e) => {
      fetch(`/emails/${id}`)
        .then(response => response.json())
        .then(email => {
          // Print email
          console.log(email);
          load_mailbody(email, mailbox);
          // ... do something else with email ...
        });
    })



    let view = document.createTextNode(`to view`);
    a.appendChild(view)


    td1.appendChild(sender);
    td2.appendChild(subject);
    td3.appendChild(timestamp);
    td4.appendChild(a);

    tr.appendChild(td1);
    tr.appendChild(td2);
    tr.appendChild(td3);
    tr.appendChild(td4);


    table.appendChild(tr);
  }

  emails_view.appendChild(table);
}

function load_mailbody(email, mailbox) {

  fetch(`/emails/${email.id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  })
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';

  p = document.getElementsByTagName('p');
  p[0].innerHTML = `<strong>From: ${email.sender}</strong>`;
  p[1].innerHTML = `<strong>To:  ${email.recipients}</strong>`;
  p[2].innerHTML = `<strong>Subject:  ${email.subject}</strong>`;
  p[3].innerHTML = `<strong>Timestamp:  ${email.timestamp}</strong>`;
  p[4].innerHTML = `${email.body}`;

  archive = document.querySelector("#archive");
  dearchive = document.querySelector("#dearchive");
  reply = document.querySelector("#reply");

  if (mailbox == 'sent') {
    archive.style.visibility = "hidden"
    dearchive.style.visibility = 'hidden';
    reply.style.display = 'none';
  }
  else {
    archive.style.visibility = "visible"
    dearchive.style.visibility = 'visible';
    reply.style.display = 'block';

  }

  if (email.archived == true) {

    archive.style.display = 'none';
    dearchive.style.display = 'block';

    dearchive.onclick = () => {
      dearchive_email(email);
      archive.style.display = 'block';
      dearchive.style.display = 'none';
    }

  }
  else {
    archive.style.display = 'block';
    dearchive.style.display = 'none';
    archive.onclick = () => {
      archive_email(email);
      archive.style.display = 'none';
      dearchive.style.display = 'block';
    }
  }

  reply.onclick = () => {
    reply_email(email);
  }

}



function archive_email(email) {
  console.log(email)

  fetch(`/emails/${email.id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: true
    })
  }).then(() => document.location.reload(true))
}

function dearchive_email(email) {

  console.log(email)

  fetch(`/emails/${email.id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: false
    })
  }).then(() => document.location.reload(true))
}


function reply_email(email){
  
  compose_email(email);
}

