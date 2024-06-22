import { Component, ViewChild, HostListener } from "@angular/core";
import { MessageService, ConfirmationService } from "primeng/api";
import { ApiService } from "src/app/services/api.service";
import { AuthService } from "src/app/services/auth.service";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Table } from "primeng/table";
import { HttpHeaders } from "@angular/common/http";
import { LayoutService } from "src/app/layout/service/app.layout.service";
import { ActivatedRoute, Router } from "@angular/router";
import { FileUpload } from "primeng/fileupload";
import { MenuService } from "src/app/layout/app.menu.service";
import * as CryptoJS from 'crypto-js';
import { lastValueFrom } from "rxjs/internal/lastValueFrom";

const queryParams = { dt: new Date().toISOString(), web: true };
const queryParamsupdate = {
  dt: new Date().toISOString(),
  web: true,
  ep: "update",
};

@Component({
  selector: 'app-transaksibarang',
  templateUrl: './transaksibarang.component.html',
  styleUrls: ['./transaksibarang.component.scss']
})
export class TransaksibarangComponent {
  @ViewChild("fileU") fileUpload: FileUpload;
  @ViewChild("vsTable") vsTable: Table;
  @HostListener("window:keydown.control.q", ["$event"])
  bukaDialog(event: KeyboardEvent) {
    event.preventDefault();
    if (this.pageSukses) {
      if (!this.popForm) {
        this.openPop("", 1);
      } else {
        this.popForm = false;
      }
    }
  }
  scrWidth: any;
  @HostListener("window:resize", ["$event"])
  getScreenSize(event?) {
    this.scrWidth = window.innerWidth;
  }

  //sesi
  sesiidakun: any;
  sesiusername: any;
  sesitoken: any;
  sesinama: any;
  sesiunik: any;

  //data table
  isidata: any[] = [];
  total: any;
  totaltampil: any;
  order: any;
  direction: any = true;
  lastOrder: string = '';
  page: any;
  aktifpage: any;
  cari: any = "";
  collectionSize: any;

  tablecolom = [
    {namakolom: 'No.', class: 'w-0.1'},
    {namakolom: 'Waktu Transaksi', class: 'orderdata', order: 'nama_suplier'},
    {namakolom: 'Nama Barang'},
    {namakolom: 'Kode Barang', class: 'orderdata', order: 'lokasi_suplier'},
    {namakolom: 'Barcode'},
    {namakolom: 'Jumlah Karton'},
    {namakolom: 'Jumlah Pcs'},
    {namakolom: 'Harga Beli'},
    {namakolom: 'Harga Jual'},
  ]

  //form
  formInput: FormGroup;
  namabarang: any;
  idsuplier: any;
  namasuplier : any;
  kodesuplier : any;
  lokasisuplier : any;
  kontaksuplier : any;
  //opsional
  pjsuplier : any;
  keterangan : any;

  //data select
  isidatakategori: any[] = [];
  totalkategori: any;
  totaltampilkategori: any;
  pagekategori: any = 1;
  carikategori: any = "";
  collectionSizekategori: any;
  idselectedkategori: any;
  maxpagekategori: any;

  loadingselect: boolean;

  namaKategoribarang: any;
  idkategori_barang: any;

  //loading
  load: any[] = [];
  loadingData: boolean = true;
  pageSukses = false;
  pageGagal = false;
  formGagal = false;
  loadingForm = false;
  loadingButton: boolean;
  loadingHapus: any;

  //event
  popForm: boolean = false;
  namaForm: string;
  unvalid = false;
  getStatistic = false;
  subRoute: any;

  //test chart awoawkaowkaow
  basicData: any;
  basicOptions: any;

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private layoutservice: LayoutService,
    public actRoute: ActivatedRoute,
    public route: Router,
  ) {}

  async ngOnInit() {
    this.subRoute = this.actRoute.queryParams.subscribe((params) => {
      if (params["p"]) {
        if (isNaN(params["p"])) {
          this.page = 1;
          this.route.navigate([], {
            queryParams: { p: this.page },
            queryParamsHandling: "merge",
          });
        } else {
          this.page = params["p"];
        }
      } else {
        this.page = 1;
        this.route.navigate([], {
          queryParams: { p: this.page },
          queryParamsHandling: "merge",
        });
      }
    });
    this.api.setHeader("Suplier");
    this.getScreenSize();

    //form
    this.formInput = this.fb.group({
      namasuplier: ["", [Validators.required]],
      kodesuplier: ["", [Validators.required]],
      lokasisuplier: ["", [Validators.required]],
      kontaksuplier: ["", [Validators.required]],
      pjsuplier: ["", []],
      keterangan: ["", []],
    });

    await this.loadStorage();
    const page_s = localStorage.getItem("search_history") || "{}";
    const page_v = JSON.parse(page_s);
    if (page_s !== "{}") {
      this.cari = page_v.cari;
    } else {
      this.cari = "";
    }
    await this.listData();
    this.generateChart();
  }

  ngOnDestroy() {
    this.subRoute.unsubscribe();
  }

  async loadStorage() {
    const sesi = localStorage.getItem(this.api.sesilogin);
    this.decrypt(sesi)
  }

  async decrypt(data: string) {
    const bytes = CryptoJS.AES.decrypt(data,'wh-AES-secrt-key-ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890');
    const decrypted = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    this.sesiidakun = decrypted.idakun;
    this.sesiusername = decrypted.username;
    this.sesitoken = decrypted.token;
    this.sesinama = decrypted.nama;
    return decrypted;
  }

  async listData(): Promise<void> {
    this.loadingData = true;  
    const param = new FormData();
    param.append("halaman", this.page);
    param.append("cari", this.cari);
    param.append("totaltampil", this.totaltampil);
    param.append("od", this.order);
    param.append("dr", this.direction);
  
    const headers = new HttpHeaders({
      sesiidakun: this.sesiidakun,
      sesiusername: this.sesiusername,
      Authorization: `Bearer ${this.sesitoken}`,
    });
  
    try {
      const data: any = this.api.postData(param, "listtransaksibarang/" + this.page, { headers }, queryParams)
      const res: any = await lastValueFrom(data);
      if (res.status === 1) {
        this.messageService.add({
          severity: "error",
          summary: res.pesan,
          detail: "Akses Anda ditolak!",
        });
        this.auth.logout();
      } else if (res.status === 2) {
        this.messageService.add({
          severity: "warn",
          summary: res.pesan,
          detail: "Harap Tunggu!",
        });
        this.page = 1;
        this.route.navigate([], {
          queryParams: { p: this.page },
          queryParamsHandling: "merge",
        });
        await this.listData();
      } else if (res.status === 99) { 
        this.api.setCustomtitle('Barang');
        this.loadingData = false;
        this.pageSukses = true;
        this.total = res.total;
        this.aktifpage = res.start;
        this.totaltampil = res.length;
  
        const waktusekarang = new Date().getTime();
        res.hasil.forEach((item) => {
          const waktuinsert = new Date(item.waktuinsert).getTime();
          const selisihwaktu = waktusekarang - waktuinsert;
          const selisihmenit = selisihwaktu / (1000 * 60);
          item.selisihwaktu = selisihmenit;
        });
        this.isidata = res.hasil;
      }
    } catch (err) {
      this.loadingData = false;
      if (err.status === 401) {
        this.api.error(err);
        setTimeout(() => {
          this.loadStorage();
          this.listData();
        }, 300);
      } else {
        this.api.error(err);
        this.gagalPost(1, "");
      }
    }
  }  

  async tambah(): Promise<boolean> {
    this.loadingButton = true;
    this.unvalid = true;
    if (!this.formInput.valid) {
      this.loadingButton = false;
      return false;
    }
    const formValues = this.formInput.value;
    const namasuplier = formValues.namasuplier.replace(/\b\w/g, (char: string) => char.toUpperCase()).trim();
    const kodesuplier = formValues.kodesuplier;
    const lokasisuplier = formValues.lokasisuplier.replace(/\b\w/g, (char: string) => char.toUpperCase()).trim();
    const kontaksuplier = formValues.kontaksuplier;
    const pjsuplier = formValues.pjsuplier ? formValues.pjsuplier.replace(/\b\w/g, (char: string) => char.toUpperCase()).trim() : '';
    const keterangan = formValues.keterangan ? formValues.keterangan.trim() : '';
    if (this.api.kataKasar(namasuplier)) {
      this.messageService.add({
        severity: "error",
        summary: "Text/Prompt Error!",
        detail: "Data yang anda input mengandung kata-kata yang dilarang.",
      });
      return false;
    }
    const param = new FormData();
    param.append("namasuplier", namasuplier);
    param.append("kodesuplier", kodesuplier);
    param.append("lokasisuplier", lokasisuplier);
    param.append("kontaksuplier", kontaksuplier);
    if (pjsuplier) param.append("pjsuplier", pjsuplier);
    if (keterangan) param.append("keterangan", keterangan);
    const headers = new HttpHeaders({
      sesiidakun: this.sesiidakun,
      sesiusername: this.sesiusername,
      Authorization: `Bearer ${this.sesitoken}`,
    });
    try {
      const data: any = await this.api.postData(param, "tambahsuplier", { headers }, queryParams);
      const res: any = await lastValueFrom(data);
      this.loadingButton = false;
      if (res.status === 1) {
        this.messageService.add({
          severity: "error",
          summary: res.pesan,
          detail: "Akses Anda ditolak!",
        });
        this.auth.logout();
      } else if (res.status === 2 || res.status === 3) {
        this.messageService.add({
          severity: "error",
          summary: res.pesan,
          detail: "Coba masukan data lain",
        });
      } else if (res.status === 99) {
        this.popForm = false;
        this.messageService.add({
          severity: "success",
          summary: res.pesan,
          detail: "Anda berhasil menambah data kategoribarang!",
        });
        this.page = 1;
        this.listData();
      }
      return true;
    } catch (err) {
      if (err.status === 401) {
        this.loadingButton = false;
        this.api.error(err);
        setTimeout(() => {
          this.loadStorage();
          this.tambah();
        }, 300);
      } else {
        this.api.error(err);
        this.gagalPost(3, "");
      }
      return false;
    } finally {
      this.loadingButton = false;
    }
  }
  
  

  async dataList(id: string): Promise<void> {
    this.loadingForm = true;
  
    const param = new FormData();
    param.append("idsuplier", id);
  
    const headers = new HttpHeaders({
      sesiidakun: this.sesiidakun,
      sesiusername: this.sesiusername,
      Authorization: `Bearer ${this.sesitoken}`,
    });
  
    try {
      const data: any = await this.api.postData(param, "datasuplier", { headers });
      const res: any = await lastValueFrom(data);
      this.loadingForm = false;
  
      if (res.status === 1) {
        this.messageService.add({
          severity: "error",
          summary: res.pesan,
          detail: "akses data ditolak!",
        });
        this.auth.logout();
      } else if (res.status === 2) {
        this.messageService.add({
          severity: "error",
          summary: res.pesan,
          detail: "pastikan data yang diperbaharui sudah benar!",
        });
        this.popForm = false;
      } else if (res.status === 3) {
        this.messageService.add({
          severity: "error",
          summary: res.pesan,
          detail: "pastikan data yang diperbaharui sudah benar!",
        });
      } else if (res.status === 99) {
        this.namasuplier = res.namasuplier;
        this.kodesuplier = res.kodesuplier;
        this.lokasisuplier = res.lokasisuplier;
        this.kontaksuplier = res.kontaksuplier;
        this.pjsuplier = res.pjsuplier;
        this.keterangan = res.keterangan;
      }
    } catch (err) {
      this.loadingForm = false;
  
      if (err.status === 401) {
        this.api.error(err);
        setTimeout(() => {
          this.loadStorage();
          this.dataList(id);
        }, 300);
      } else {
        this.api.error(err);
        this.gagalPost(4, "");
      }
    }
  }
  

  async perbarui(): Promise<boolean> {
    this.loadingButton = true;
    this.unvalid = true;
    if (!this.formInput.valid) {
      this.loadingButton = false;
      return false;
    }
    const formValues = this.formInput.value;
    const namasuplier = formValues.namasuplier.replace(/\b\w/g, (char: string) => char.toUpperCase()).trim();
    const kodesuplier = formValues.kodesuplier;
    const lokasisuplier = formValues.lokasisuplier.replace(/\b\w/g, (char: string) => char.toUpperCase()).trim();
    const kontaksuplier = formValues.kontaksuplier;
    const pjsuplier = formValues.pjsuplier ? formValues.pjsuplier.replace(/\b\w/g, (char: string) => char.toUpperCase()).trim() : '';
    const keterangan = formValues.keterangan ? formValues.keterangan.trim() : '';
    if (this.api.kataKasar(namasuplier)) {
      this.messageService.add({
        severity: "error",
        summary: "Text/Prompt Error!",
        detail: "Data yang anda input mengandung kata-kata yang dilarang.",
      });
      return false;
    }
    const param = new FormData();
    param.append("idsuplier", this.idsuplier);
    param.append("namasuplier", namasuplier);
    param.append("kodesuplier", kodesuplier);
    param.append("lokasisuplier", lokasisuplier);
    param.append("kontaksuplier", kontaksuplier);
    if (pjsuplier) param.append("pjsuplier", pjsuplier);
    if (keterangan) param.append("keterangan", keterangan);
    const headers = new HttpHeaders({
      sesiidakun: this.sesiidakun,
      sesiusername: this.sesiusername,
      Authorization: `Bearer ${this.sesitoken}`,
    });
    try {
      const data: any = await this.api.postData(param, "updatesuplier", { headers }, queryParamsupdate);
      const res: any = await lastValueFrom(data);

      this.loadingButton = false;
      if (res.status === 1) {
        this.messageService.add({
          severity: "error",
          summary: res.pesan,
          detail: "Akses Anda ditolak!",
        });
        this.auth.logout();
      } else if (res.status === 2) {
        this.messageService.add({
          severity: "error",
          summary: res.pesan,
          detail: "Pastikan data yang ingin anda akses",
        });
        this.popForm = false;
      } else if (res.status === 3 || res.status === 4) {
        this.messageService.add({
          severity: "warn",
          summary: res.pesan,
          detail: "Opps, cobalah ketik data yang lain",
        });
      } else if (res.status === 99) {
        this.messageService.add({
          severity: "success",
          summary: res.pesan,
          detail: "Anda berhasil merubah data di suplier!",
        });
        this.popForm = false;
        await this.listData();
      }
      return true;
    } catch (err) {
      this.loadingButton = false;
      if (err.status === 401) {
        this.api.error(err);
        setTimeout(() => {
          this.loadStorage();
          this.perbarui();
        }, 300);
      } else {
        this.api.error(err);
        this.gagalPost(5, "");
      }
      return false;
    } finally {
      this.loadingButton = false;
    }
  }
  

  async hapusData(id: string): Promise<void> {
    this.loadingHapus = id;
  
    const param = new FormData();
    param.append("idsuplier", id);
  
    const headers = new HttpHeaders({
      sesiidakun: this.sesiidakun,
      sesiusername: this.sesiusername,
      Authorization: `Bearer ${this.sesitoken}`,
    });
  
    try {
      const data: any = await this.api.postData(param, "hapussuplier", { headers }, queryParams);
      const res: any = await lastValueFrom(data);
  
      this.loadingHapus = false;
  
      if (res.status === 1) {
        this.messageService.add({
          severity: "error",
          summary: res.pesan,
          detail: "Akses Anda ditolak!",
        });
        this.auth.logout();
      } else if (res.status === 2) {
        this.messageService.add({
          severity: "error",
          summary: res.pesan,
          detail: "Pastikan data yang ingin anda akses",
        });
      } else if (res.status === 99) {
        this.messageService.add({
          severity: "success",
          summary: res.pesan,
          detail: "Anda berhasil menghapus data barang!",
        });
        this.listData();
      }
    } catch (err) {
      this.loadingHapus = false;
  
      if (err.status === 401) {
        this.api.error(err);
        setTimeout(() => {
          this.loadStorage();
          this.hapusData(id);
        }, 300);
      } else {
        this.api.error(err);
      }
    }
  }
  


  async konfirmHapus(id, target) {
    this.idsuplier = id.id_suplier;
    this.confirmationService.confirm({
      target: target,
      message: "yakin ingin menghapus " + id.namasuplier + "?",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Hapus",
      rejectLabel: "Batal",
      dismissableMask: true,
      key: id.id_suplier,
      acceptButtonStyleClass: "p-button-danger",
      accept: () => {
        this.hapusData(id.id_suplier);
      },
      reject: () => {},
    });
  }

  //form
  async formKosong() {
    this.formInput.get("namasuplier").reset(); 
    this.formInput.get("kodesuplier").reset(); 
    this.formInput.get("lokasisuplier").reset(); 
    this.formInput.get("kontaksuplier").reset(); 
    this.formInput.get("pjsuplier").reset(); 
  }

  //event

  async orderData(p) {
    let currentOrder = '';
    currentOrder = p;
    if (this.lastOrder === currentOrder) {
      this.direction = !this.direction;
    } else {
      this.direction = true;
    }
    this.lastOrder = currentOrder;
    this.order = currentOrder;
    this.listData();
}

  async gagalPost(tipe, id) {
    var gagal = [
      {
        tipe: tipe,
        id: id,
      },
    ];
    this.loadStorage();
    this.load = gagal;
    if (tipe == 1) {
      this.pageGagal = true;
      this.pageSukses = false;
    } else if (tipe == 2 || tipe == 3 || tipe == 4 || tipe == 5) {
      this.formGagal = true;
    }
  }

  async reload(param, id) {
    if (param == 1) {
      this.pageGagal = false;
      this.listData();
    } else if (param == 3) {
      this.formGagal = false;
      this.tambah();
    } else if (param == 4) {
      this.formGagal = false;
      this.dataList(this.idsuplier);
    } else if (param == 5) {
      this.formGagal = false;
      this.perbarui();
    }
  }

  async refresh() {
    this.page = 1;
    this.cari = "";
    this.totaltampil = undefined;
    this.order = undefined;
    this.lastOrder = '';
    this.direction = true;
    this.route.navigate([], {
      queryParams: { p: this.page },
      queryParamsHandling: "merge",
    });
    this.listData();
  }

  async openPop(p1, p2) {
    if (p2 == 1) {
      this.popForm = true;
      this.namaForm = "Tambah Barang";
    } else if (p2 == 2) {
      this.dataList(p1.id_suplier);
      this.popForm = true;
      this.namaForm = "Perbarui Data Barang";
      this.idsuplier = p1.id_suplier;
    }
  }

  async emitsearch() {
    var dataPage = {
      cari: this.cari,
    };
    if (this.cari !== '' || undefined){
      this.page = 1;
      this.route.navigate([], {
        queryParams: { p: this.page },
        queryParamsHandling: "merge",
      });
      this.listData();
      await localStorage.setItem('search_history', JSON.stringify(dataPage));
    }
    else {
      this.cari = '';
      localStorage.removeItem('search_history');
    }
  }

  async search(e){
    this.cari = e;
    if (this.cari === '' || undefined) {
      const page_s = localStorage.getItem('search_history');
      const page_v = JSON.parse(page_s);
      if (page_v !== null) {
        this.page = 1;
        this.route.navigate([], {
          queryParams: { p: this.page },
          queryParamsHandling: "merge",
        });
        this.listData();
        localStorage.removeItem('search_history');
      } else {
        this.cari = '';
      }
    }
  }

  async pageChange(e) {
    if (e.page + 1 !== this.page ){
      this.page = e.page + 1;
      this.totaltampil = e.rows;
      this.route.navigate([], {
        queryParams: { p: this.page },
        queryParamsHandling: "merge",
      });
      this.listData();
    }
  }

  //chart event

  async openChart(){
    this.getStatistic = !this.getStatistic;
  }

  async generateChart() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue(
      '--text-color-secondary'
    );
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    this.basicData = {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [
        {
          label: 'Sales',
          data: [540, 325, 702, 620],
          backgroundColor: [
            'rgba(255, 159, 64, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(153, 102, 255, 0.2)',
          ],
          borderColor: [
            'rgb(255, 159, 64)',
            'rgb(75, 192, 192)',
            'rgb(54, 162, 235)',
            'rgb(153, 102, 255)',
          ],
          borderWidth: 1,
        },
      ],
    };

    this.basicOptions = {
      plugins: {
        legend: {
          labels: {
            color: textColor,
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: textColorSecondary,
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false,
          },
        },
        x: {
          ticks: {
            color: textColorSecondary,
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false,
          },
        },
      },
    };
  }

}
