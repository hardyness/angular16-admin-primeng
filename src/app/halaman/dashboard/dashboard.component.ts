import { Component, OnInit, OnDestroy, ViewChild, HostListener } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Subscription } from 'rxjs';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { FormGroup, FormBuilder, FormControl, Validators } from "@angular/forms";
import { Table } from 'primeng/table';
import { HttpHeaders } from '@angular/common/http';

const sesilogin = 'masterkbmv4_login';

@Component({
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  @ViewChild('vsTable') vsTable:Table;
  scrWidth:any;
  @HostListener('window:resize', ['$event'])
  getScreenSize(event?) {
    this.scrWidth = window.innerWidth;
    if (this.scrWidth < 768){
      this.widthchart = '480px';
      this.heightchart = '300px';
    }
    else if (this.scrWidth >= 768){
      this.widthchart = '100%';
      this.heightchart = '360px';
    }
    else if (this.scrWidth >= 1440){
      this.widthchart = '100%';
      this.heightchart = '460px';
    }
  }

  //sesi
  sesiidlogin: any;
  sesiusername: any;
  sesitoken: any;
  sesinama: any;
  sesiunik: any;

  //data
  isidata: any[] = [];
  total: any;
  totaltampil: any;
  page: any;
  cari: any = '';
  collectionSize: any;
  pageSize: any;
  totalinput: any;
  grafikPengunjung: any[] = [];
  labelGrafikpengunjung: any[] = [];
  katalog: any;
  produk: any;
  pengunjung: any;

  //loading
  load: any[] = [];
  loading: boolean = true;
  pageSukses = false;
  pageGagal = false;
  formGagal = false;
  loadingForm = false;
  loadingButton: boolean;
  loadingSelect: boolean;

  //event
  popForm: boolean = false;
  namaForm: string;
  unvalid = false;
  widthchart: any;
  heightchart: any;
  formattedDates: string[] = [];

  items!: MenuItem[];

  chartData: any;

  chartOptions: any;

  constructor(public layoutService: LayoutService,
    private api: ApiService,
    private auth: AuthService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    ) {
  }

  async ngOnInit() {
    await this.loadStorage()
    this.dataBeranda();
    this.getScreenSize();
  }

  async loadStorage(){
    const sesi = localStorage.getItem(sesilogin);
    const sesivalue = JSON.parse(sesi);
    this.sesiidlogin = sesivalue.sesiidlogin;
    this.sesiusername = sesivalue.sesiusername;
    this.sesitoken = sesivalue.sesitoken;
    this.sesinama = sesivalue.sesinama;
    this.sesiunik = sesivalue.sesiunik;

    //paging
    const page_s = localStorage.getItem('pagingBeranda')  || '{}';
    const page_v = JSON.parse(page_s);
    if (page_s !== '{}'){
      this.page = page_v.page;
      this.isidata = page_v.isi;
      setTimeout(() => {
        document.getElementById('tabel').scrollTo(0, page_v.scrl)
      }, 600)
    } else {
      this.page = 1;
      this.totalinput = 0;
      this.isidata = [];
    }
  }

  async dataBeranda(){
    this.api.setTitle();
    this.loading = true;
    return new Promise (resolve => {
      const param = new FormData();
      var headers = new HttpHeaders({
        'x-access-token': this.sesitoken,
        'x-access-unik': this.sesiunik,
        'akses': '2590AB083AAD0A4B2D092375F2F1B33A52B3CA922A9E24CF449DD00AB2567049',
        'sesiidlogin': this.sesiidlogin,
        'sesiusername': this.sesiusername,
      });
      this.api.postData(param, 'beranda/data', {headers}).subscribe((res: any) => {
        this.collectionSize = Math.ceil(parseInt(res.total) / parseInt(res.length));
        if (res.status == 1){
          this.messageService.add({severity: 'error', summary: res.pesan, detail: 'Akses Anda ditolak!'});
          this.auth.logout();
        } else if (res.status == 99){
          this.loading = false;
          this.pageSukses = true;
          this.grafikPengunjung = res.datagrafikpengunjung;
          this.labelGrafikpengunjung = res.labelgrafikpengunjung;
          this.produk = res.produk;
          this.pengunjung = res.pengunjung;
          this.katalog = res.katalog;
          this.initChart();
        }
      }, ((err) => {
        if (err.status == 401){
          this.api.error(err);
          setTimeout(() => {
            this.loadStorage();
            this.dataBeranda();
          }, 300)
        } 
        else {
          this.api.error(err);
          this.gagalPost(1, '');
        }
      }))
    })
  }

  async initChart() {
    await this.formatDates(this.labelGrafikpengunjung);
    var isidata = {
      "labelgrafikpengunjung": this.formattedDates,
      "datagrafikpengunjung": this.grafikPengunjung
    };
    if (this.scrWidth <= 768) {
      isidata = {
        "labelgrafikpengunjung": this.formattedDates,
        "datagrafikpengunjung": this.grafikPengunjung
      };
    } else {
      isidata = {
        "labelgrafikpengunjung": this.labelGrafikpengunjung,
        "datagrafikpengunjung": this.grafikPengunjung
      };
    }
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    this.chartData = {
      labels: isidata.labelgrafikpengunjung,
      datasets: [
        {
          label: 'Data Pengunjung',
          data: isidata.datagrafikpengunjung,
          fill: false,
          backgroundColor: documentStyle.getPropertyValue('--bluegray-700'),
          borderColor: documentStyle.getPropertyValue('--bluegray-700'),
          tension: .4
        },
      ]
    };

    this.chartOptions = {
      plugins: {
        legend: {
          labels: {
            color: textColor,
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary,
            font: {
              size: 9
            }
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        },
        y: {
          ticks: {
            color: textColorSecondary,
            stepSize: 1
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false,
          }
        }
      }
    };
  }

  async formatDates(tanggal) {
    const bulan = {
      'Januari': '01',
      'Februari': '02',
      'Maret': '03',
      'April': '04',
      'Mei': '05',
      'Juni': '06',
      'Juli': '07',
      'Agustus': '08',
      'September': '09',
      'Oktober': '10',
      'November': '11',
      'Desember': '12'
    };

    this.formattedDates = tanggal.map(originalDate => {
      const parts = originalDate.split(', ');
      if (parts.length === 2) {
        const [day, dateMonthYear, years] = parts[1].split(' ');
        const month = bulan[dateMonthYear.split(' ')[0]];
        const year = years;
        return `${day}-${month}-${year}`;
      }
      return 'Invalid Date';
    });
  }

  async gagalPost(tipe, id) {
    var gagal = [{
      tipe: tipe,
      id: id,
    }];
    this.loadStorage();
    this.load = gagal;
    if (tipe == 1){
      this.pageGagal = true;
      this.pageSukses = false;
    } else if (tipe == 2 || tipe == 3 || tipe == 4 || tipe == 5){
      this.formGagal = true
    }
  }

  async reload(param, id){
    if (param == 1) {
      this.pageGagal = false;
      this.dataBeranda();
    }
  }
}
