import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { ContactosService } from '../../services/contactos.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  credentialForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private contactoService: ContactosService,
    private toastController: ToastController,
  ) { }

  ngOnInit() {
    this.credentialForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }
  async signUp() {
    const loading = await this.loadingController.create();
    await loading.present();
    this.contactoService
      .signup(this.credentialForm.value)
      .then(
        (user) => {
          loading.dismiss();
          this.router.navigateByUrl('/contactos', { replaceUrl: true });
        },
        async (err) => {
          loading.dismiss();
          const alert = await this.alertController.create({
            header: 'Sign up failed',
            message: err.message,
            buttons: ['OK'],
          });

          await alert.present();
        }
      );
  }
  async signIn() {
    const loading = await this.loadingController.create();
    await loading.present();

    if (this.credentialForm.valid) {
      const credentials = {
        email: this.credentialForm.value.email,
        password: this.credentialForm.value.password
      };

      const user = await this.contactoService.signIn(credentials).catch((err) => {
        this.presentToast(err);
        console.log(err);
        loading.dismiss();
      });

      if (user) {
        loading.dismiss();
        this.router.navigate(['/contactos']);
      }
    } else {
      console.log('Please provide all the required values!');
    }
  }
  get errorControl() {
    return this.credentialForm.controls;
  }

  async presentToast(message: undefined) {
    console.log(message);

    const toast = await this.toastController.create({
      message: message,
      duration: 1500,
      position: 'top',
    });

    await toast.present();
  }

  // Easy access for form fields
  get email() {
    return this.credentialForm.get('email');
  }

  get password() {
    return this.credentialForm.get('password');
  }
}
