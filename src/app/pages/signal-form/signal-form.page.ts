import { Component, OnInit } from '@angular/core';
import { RemoteServiceService } from '../../service/remote-service.service';
import { Geolocation, Geoposition, PositionError } from '@awesome-cordova-plugins/geolocation/ngx';
import {NavController, PopoverController, ActionSheetController, Platform, ModalController} from '@ionic/angular';
import { Camera, CameraOptions } from '@awesome-cordova-plugins/camera/ngx';
import { Base64 } from '@ionic-native/base64/ngx';
import { DomSanitizer, SafeResourceUrl, SafeUrl, } from '@angular/platform-browser';

@Component({
  selector: 'app-signal-form',
  templateUrl: './signal-form.page.html',
  styleUrls: ['./signal-form.page.scss'],
})
export class SignalFormPage implements OnInit {
  formDataSignal = new FormData();
  signal = {
    file : "",
    typeSignal : "Accident",
    description : "",
    latitude : 0,
    longitude : 0,
    status : "Nouveau",
    date : new Date(),
    username : "",
  }
  take_photo;
  Alltypes = [];
  token;
  data;
  mydata = [];
  prise_photos = [];
    constructor(
    private apiService : RemoteServiceService,
    private geolocation: Geolocation,
    public modalController: ModalController,
    private camera: Camera,
    public  actionSheetController: ActionSheetController,
    private base64: Base64, 
    private sanitizer: DomSanitizer,

    ) {}

  ngOnInit() {
    this.token = this.apiService.getUserDatas().accessToken;
    this.signal.username = this.apiService.getUserDatas().username;
    this.apiService.getAllTypeSignals(this.token).subscribe((e)=>{
      this.Alltypes = e;
    })
  }

  valider(){
  this.apiService.presentLoading();
    let geoPosition = this.geolocation.watchPosition().subscribe(position => {
      if ((position as Geoposition).coords != undefined) {
        var geoposition = (position as Geoposition);
        console.log('Latitude: ' + geoposition.coords.latitude + ' - Longitude: ' + geoposition.coords.longitude);
        this.signal.latitude = geoposition.coords.latitude;
        this.signal.longitude = geoposition.coords.longitude;

        this.formDataSignal.append('typeSignal',this.signal.typeSignal);
        this.formDataSignal.append('description',this.signal.description);
        this.formDataSignal.append('latitude',this.signal.latitude.toString());
        this.formDataSignal.append('longitude',this.signal.longitude.toString());
        this.formDataSignal.append('status',this.signal.status);
        this.formDataSignal.append('date',this.signal.date.toUTCString());
        this.formDataSignal.append('username',this.signal.username);

        if(this.prise_photos.length !=0 && this.prise_photos[0].url){
          this.formDataSignal.append("file", this.prise_photos[0].url);
        }

        if(this.mydata.length !=0 && this.mydata[0].url){
          this.formDataSignal.append("file", this.mydata[0].url);
        }
0
        this.apiService.doSignal(this.formDataSignal,this.token).subscribe((e)=>{
          this.apiService.presentToast(e.message);
          if(e.message == "Saved successfully"){
            this.apiService.navigate('signalements');
            this.apiService.dismissLoading();
            this.formDataSignal = new FormData();
          }
        })
      } else { 
        var positionError = (position as PositionError);
        console.log('Error ' + positionError.code + ': ' + positionError.message);
        this.apiService.presentToast('Erreur de localisation');
        this.apiService.dismissLoading();
        this.formDataSignal = new FormData();
      }
  });

    
  }
  
  onFileChange(fileChangeEvent) {
    const photo = fileChangeEvent.target.files[0];
    this.formDataSignal.append("file", photo, photo.name);
  }

  async takePicture() {
    const actionSheet = await this.actionSheetController.create({
      // eslint-disable-next-line @typescript-eslint/quotes
      header: "Choisir le source de l'image ",
      buttons: [
        {
          text: 'Image dans la memoire',
          icon: 'videocam',
          handler: () => {
            this.pickImage();
          },
        },
        {
          text: 'Utiliser appareil photos',
          icon: 'camera',
          handler: () => {
            this.takeImage(this.camera.PictureSourceType.CAMERA);
          },
        },
        {
          text: 'Annuler',
          role: 'cancel',
          icon: 'close',
        },
      ],
    });
    await actionSheet.present();
  }

  async pickImage(){
    this.apiService.openImageFromGallery().then(
      async (results) => {
        for (let i = 0; i < results.length; i++) {
          const img_base64 = results[i];
          this.ToBase64(img_base64,'data:Image/*;base64,','img')
        }
      }
    );
  }

  ToBase64(data,mode,type) {
    this.base64.encodeFile(data).then(
      async (base64File: string) => {
        const photos = base64File?.split('base64,')[1];
        this.data.push(photos);
        const source = this.sanitizer.bypassSecurityTrustUrl(mode + photos);
        this.mydata.push({
          url: source,
          type: type,
        });
      },
      (err) => {
        alert(err)
      }
    );
  }

  async takeImage(sourceType: any) {
    this.apiService.TakeImage().then(
      async (photos) => {
        const image_base_64 = photos;
        this.take_photo.push(image_base_64);
        const source = this.sanitizer.bypassSecurityTrustUrl('data:Image/*;base64,' + image_base_64);
        this.prise_photos.push({
          url: source,
          type: 'img',
        });
      },
      (err) => {
        alert(err);
      }
    );
  }

  removePic(k) {
    this.mydata.splice(k, 1);
    this.data.splice(k, 1);
    this.prise_photos.splice(k, 1);
  }

}
