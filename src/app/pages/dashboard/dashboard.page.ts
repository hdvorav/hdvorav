import { Component, OnInit } from '@angular/core';
import { RemoteServiceService } from '../../service/remote-service.service';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
  userName = "";
  usrDatas;
  constructor(private apiService : RemoteServiceService,private menu: MenuController) { }

  ngOnInit() {
    this.usrDatas = this.apiService.getUserDatas();
    // this.apiService.getUserDatas();
  }
  openMenu() {
    this.menu.open('custom');
  }
  naigateTo(page){
    this.apiService.navigate(page);
  }
}
