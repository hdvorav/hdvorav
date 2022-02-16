import { Component, OnInit } from '@angular/core';
import { ActionSheetController } from '@ionic/angular';
import { RemoteServiceService } from '../../service/remote-service.service';
@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
})
export class NotificationsPage implements OnInit {
  mySignals;
  token;
  username;
  constructor(
    private apiService : RemoteServiceService,
    public  actionSheetController: ActionSheetController,

    ) { }

  ngOnInit() {
    this.token = this.apiService.getUserDatas().accessToken;
    this.username = this.apiService.getUserDatas().username;
    this.apiService.getAllMySignals(this.token,this.username).subscribe((e)=>{
      let filtered = e.filter(function(dataM) {
          return  dataM.status == "Terminé";
      });
      this.mySignals = filtered;
    })
  }

  async deleteSignal(signals){
    const actionSheet = await this.actionSheetController.create({
      // eslint-disable-next-line @typescript-eslint/quotes
      header: "Choisir le source de l'image ",
      buttons: [
        {
          text: 'Oui',
          handler: () => {
            this.deleteSignals(signals);
          },
        },
        {
          text: 'Non',
          handler: () => {
            this.cancelDelete();
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
  cancelDelete(){
    this.actionSheetController.dismiss();
  }
  async deleteSignals(datas){
    this.apiService.deleteSignals(this.token,datas).subscribe(async (e)=>{
      await this.ngOnInit()
    })
  }
}
