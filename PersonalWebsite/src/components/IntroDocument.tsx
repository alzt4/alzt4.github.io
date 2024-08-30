import IntroCanvas from "./introCanvas";

export default function IntroDocument() {
  return (
    <div>
      <div className="IntroCanvas">
        <IntroCanvas count={100}></IntroCanvas>
      </div>
      <div className="introParent">
        <h1>Hello.</h1>
        <h2>My Name is Adrian</h2>
        <div>
            <h3>About Me</h3>
            <p>I graduated from Trent University with an Honour's Bachelor in Computer Science, and a minor in Media Studies, in the June of 2024.
              As a student, I managed to be on the Dean's List for every year I was in Trent, and I graduated on the President's Honour Roll as well.
              I currently work at EasyFits, a digital fitting company. I started my journey there in September of 2023, as an Intern.
              The company's vision is a tool which allows users to generate a digital 3D avatar by taking their real life measurements and uploading it to the EasyFits website.
              Then, they will be able to use their EasyFits account to try on various pieces of clothing digitally, without ever having to visit the store.
              As an Intern, I was tasked with the creation of 3D human avatars and the features assosiated, such as hairstyles or accessories such as glasses.
              I was also task with writing the various scripts that help automate this creation process, allowing us to create client's clothes at a faster rate.
              After 3 months of internship, it was determined that my work was satisfactory enough to offer me a contract that stretches beyond my graduation.
              I then worked on implementing the physics portion of the application, which is the core part of the company's offering. I also worked on the NestJS API in order to connect the physics microservice to the front and backend.
              Through this journey, I managed to gain valuable experience working with React, NodeJS, NestJS, Python, Flask, and PostGreSQL.
            </p>
            <p>
              My personal interests lie in cybersecurity, computer graphics, and low level programming. It is my dream to work cybersecurity field, as I think that it is an important industry that provides everyone with the security they deserve.
              I am also interested in computer graphics and low level programming as a hobby. I enjoy Assembly and writing WebGL and shader code.
              I attribute this to my creative side, since my hobbies include activities such as story writing, embroidery, painting, and diorama making amongst others; and I have been trying to pick up scale modelling as well.
            </p>
        </div>
      </div>
    </div>
  )
}