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
import * as CryptoJS from 'crypto-js';
import { lastValueFrom } from "rxjs/internal/lastValueFrom";

const queryParams = { dt: new Date().toISOString(), web: true };
const queryParamsupdate = {
  dt: new Date().toISOString(),
  web: true,
  ep: "update",
};

@Component({
  selector: 'app-barangmasuk',
  templateUrl: './barangmasuk.component.html',
  styleUrls: ['./barangmasuk.component.scss']
})
export class BarangmasukComponent {
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

  //data
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
    {namakolom: 'Tanggal Masuk', class: 'orderdata', order: 'bm.waktu_transaksi'},
    {namakolom: 'Nama Barang', class: 'orderdata', order: 'lb.nama_barang'},
    {namakolom: 'Kode Barang'},
    {namakolom: 'Pcs Perkarton'},
    {namakolom: 'Jumlah Karton'},
    {namakolom: 'Jumlah Pcs'},
    {namakolom: 'Harga'},
  ]

  //form
  formBarang: FormGroup;
  namabarang: any;
  idbarang: any;
  idkategoribarang: any;
  kodebarang: any;
  barcode: any;
  nopo: any;
  pcsperkarton: any;
  stokkarton: any;
  stokpcs: any;
  hargabeli: any;
  hargajual: any;

  //data select
  isidatakategori: any[] = [];
  totalkategori: any;
  totaltampilkategori: any;
  pagekategori: any = 1;
  carikategori: any = "";
  collectionSizekategori: any;
  idselectedkategori: any;
  maxpagekategori: any;

  //loading
  load: any[] = [];
  loadingData: boolean = true;
  pageSukses = false;
  pageGagal = false;
  formGagal = false;
  loadingForm = false;
  loadingButton: boolean;
  loadingHapus: any;
  loadingselect: boolean;

  //event
  popForm: boolean = false;
  namaForm: string;
  unvalid = false;
  getStatistic = false;
  subHtttp: any;
  subRoute: any;

  //form gambar wkwkwk
  uploadGambar = [];
  isiGambar: any[] = [];
  selectedFiles: Map<number, File | null> = new Map();
  newImg: Map<number, string | ArrayBuffer | null> = new Map();
  selectedFilesupdate: any[] = [];
  newImgupdate: any[] = [];
  idgambar: any[] = [];


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
    this.api.setHeader("Barang");
    this.getScreenSize();

    //form
    this.formBarang = this.fb.group({
      namabarang: ["", [Validators.required]],
      idkategoribarang: ["", [Validators.required]],
      kodebarang: ["", [Validators.required]],
      barcode: ["", [Validators.required]],
      nopo: ["", [Validators.required]],
      pcsperkarton: ["", [Validators.required]],
      stokkarton: ["", [Validators.required]],
      stokpcs: ["", [Validators.required]],
      hargabeli: ["", [Validators.required]],
      hargajual: ["", [Validators.required]],
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
    if (this.subHtttp) {
      this.subHtttp.unsubscribe();
    }
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
      const data = this.api.postData(param, "listbarangmasuk/" + this.page, { headers }, queryParams);
      const res: any = await lastValueFrom(data);
  
      this.collectionSize = Math.ceil(parseInt(res.total) / parseInt(res.length));
      
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
        this.listData();
      } else if (res.status === 99) {
        this.api.setCustomtitle('Barang');
        this.pageSukses = true;
        this.total = res.total;
        this.aktifpage = res.start;
        this.totaltampil = res.length;
        this.isidata = res.hasil;
      }
    } catch (err) {
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
    } finally {
      this.loadingData = false;
    }
  }

  async tambah(): Promise<void> {
    this.loadingButton = true;
    this.unvalid = true;
    
    if (!this.formBarang.valid) {
      this.loadingButton = false;
      return;
    }
  
    const namabarang = this.formBarang.value.namabarang.replace(/\b\w/g, (char: string) => char.toUpperCase()).trim();
    const kodebarang = this.formBarang.value.kodebarang;
    const barcode = this.formBarang.value.barcode;
    const nopo = this.formBarang.value.nopo;
    const pcsperkarton = this.formBarang.value.pcsperkarton;
    const stokkarton = this.formBarang.value.stokkarton;
    const stokpcs = this.formBarang.value.stokpcs;
    const hargabeli = this.formBarang.value.hargabeli;
    const hargajual = this.formBarang.value.hargajual;
  
    if (this.api.kataKasar(namabarang)) {
      this.loadingButton = false;
      this.messageService.add({
        severity: "error",
        summary: "Text/Promt Error!",
        detail: "Data yang anda input mengandung kata-kata yang dilarang.",
      });
      return;
    }
  
    const param = new FormData();
    param.append("idkategoribarang", this.idkategoribarang);
    param.append("namabarang", namabarang);
    param.append("kodebarang", kodebarang);
    param.append("barcode", barcode);
    param.append("nopo", nopo);
    param.append("pcsperkarton", pcsperkarton);
    param.append("stokkarton", stokkarton);
    param.append("stokpcs", stokpcs);
    param.append("hargabeli", hargabeli);
    param.append("hargajual", hargajual);
  
    const headers = new HttpHeaders({
      sesiidakun: this.sesiidakun,
      sesiusername: this.sesiusername,
      Authorization: `Bearer ${this.sesitoken}`,
    });
  
    try {
      const data = this.api.postData(param, "tambahbarang", { headers }, queryParams);
      const res: any = await lastValueFrom(data);
  
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
        this.messageService.add({
          severity: "success",
          summary: res.pesan,
          detail: "Anda berhasil menambah data kategoribarang!",
        });
        this.popForm = false;
        if (this.total === 0) {
          this.cari = "";
          this.page = 1;
        } else {
          this.page = 1;
        }
        await this.listData();
      }
    } catch (err) {
      if (err.status === 401) {
        this.api.error(err);
        setTimeout(() => {
          this.loadStorage();
          this.tambah();
        }, 300);
      } else {
        this.api.error(err);
        this.gagalPost(3, "");
      }
    } finally {
      this.loadingButton = false;
    }
  }

  async dataList(id: string): Promise<void> {
    this.loadingForm = true;
  
    const dataPerbarui = new FormData();
    dataPerbarui.append("idbarang", id);
    
    const headers = new HttpHeaders({
      sesiidakun: this.sesiidakun,
      sesiusername: this.sesiusername,
      Authorization: `Bearer ${this.sesitoken}`,
    });
  
    try {
      const data = this.api.postData(dataPerbarui, "databarang", { headers });
      const res: any = await lastValueFrom(data);
  
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
        this.loadingForm = false;
        this.popForm = false;
      } else if (res.status === 3) {
        this.messageService.add({
          severity: "error",
          summary: res.pesan,
          detail: "pastikan data yang diperbaharui sudah benar!",
        });
        this.loadingForm = false;
      } else if (res.status === 99) {
        this.isidatakategori = [{ idkategoribarang: res.idkategoribarang, kategoribarang: res.kategoribarang, gambarkategoribarang: res.gambarkategoribarang }];
        this.idkategoribarang = res.idkategoribarang;
        this.idselectedkategori = res.idkategoribarang;
        this.namabarang = res.namabarang;
        this.kodebarang = res.kodebarang;
        this.barcode = res.barcode;
        this.nopo = res.nopo;
        this.pcsperkarton = res.pcsperkarton;
        this.stokkarton = res.stokkarton;
        this.stokpcs = res.stokpcs;
        this.hargabeli = res.hargabeli;
        this.hargajual = res.hargajual;
        this.loadingForm = false;
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

  async perbarui() {
    this.loadingButton = true;
    this.unvalid = true;
    if (!this.formBarang.valid) {
      this.loadingButton = false;
      return false;
    } else {
      var namabarang: any = this.formBarang.value.namabarang.replace(/\b\w/g, (char: string) => char.toUpperCase()).trim();
      var kodebarang: any = this.formBarang.value.kodebarang;
      var barcode: any = this.formBarang.value.barcode;
      var nopo: any = this.formBarang.value.nopo;
      var pcsperkarton: any = this.formBarang.value.pcsperkarton;
      var stokkarton: any = this.formBarang.value.stokkarton;
      var stokpcs: any = this.formBarang.value.stokpcs;
      var hargabeli: any = this.formBarang.value.hargabeli;
      var hargajual: any = this.formBarang.value.hargajual;
      if (this.api.kataKasar(namabarang)) {
        this.loadingButton = false;
        this.messageService.add({
          severity: "error",
          summary: "Text/Promt Error!",
          detail: "Data yang anda input mengandung kata-kata yang dilarang.",
        });
        return false;
      }
      return new Promise(async (resolve) => {
        const param = new FormData();
        param.append("idkategoribarang", this.idkategoribarang);
        param.append("idbarang", this.idbarang);
        param.append("namabarang", namabarang);
        param.append("kodebarang", kodebarang);
        param.append("barcode", barcode);
        param.append("nopo", nopo);
        param.append("pcsperkarton", pcsperkarton);
        param.append("stokkarton", stokkarton);
        param.append("stokpcs", stokpcs);
        param.append("hargabeli", hargabeli);
        param.append("hargajual", hargajual);
        var headers = new HttpHeaders({
          sesiidakun: this.sesiidakun,
          sesiusername: this.sesiusername,
          Authorization: `Bearer ${this.sesitoken}`,
        });
        this.api.postData(param, "updatebarang", { headers }, queryParamsupdate).subscribe(
          async (res: any) => {
            if (res.status == 1) {
              this.loadingButton = false;
              this.messageService.add({
                severity: "error",
                summary: res.pesan,
                detail: "Akses Anda ditolak!",
              });
              this.auth.logout();
            } else if (res.status == 2) {
              this.loadingButton = false;
              this.messageService.add({
                severity: "error",
                summary: res.pesan,
                detail: "Pastikan data yang ingin anda akses",
              });
              this.popForm = false;
            } else if (res.status == 3) {
              this.loadingButton = false;
              this.messageService.add({
                severity: "warn",
                summary: res.pesan,
                detail: "Opps, cobalah ketik data yang lain",
              });
            } else if (res.status == 4) {
              this.loadingButton = false;
              this.messageService.add({
                severity: "warn",
                summary: res.pesan,
                detail: "Opps, cobalah ketik data yang lain",
              });
            } else if (res.status == 99) {
              this.loadingButton = false;
              this.messageService.add({
                severity: "success",
                summary: res.pesan,
                detail: "Anda berhasil merubah data di barang!",
              });
              this.popForm = false;
              await this.listData();
            }
          },
          (err) => {
            this.loadingButton = false;
            if (err.status == 401) {
              this.api.error(err);
              setTimeout(() => {
                this.loadStorage();
                this.perbarui();
              }, 300);
            } else {
              this.api.error(err);
              this.gagalPost(5, "");
            }
          },
        );
      });
    }
  }

  async hapusData(id: string): Promise<void> {
    this.loadingHapus = id;
  
    const param = new FormData();
    param.append("idbarang", id);
    
    const headers = new HttpHeaders({
      sesiidakun: this.sesiidakun,
      sesiusername: this.sesiusername,
      Authorization: `Bearer ${this.sesitoken}`,
    });
  
    try {
      const data = this.api.postData(param, "hapusbarang", { headers }, queryParams);
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

  async selectKategori(): Promise<void> {
    this.loadingselect = true;
  
    const param = new FormData();
    param.append("halaman", this.pagekategori);
    param.append("cari", this.carikategori);
    param.append("totaltampil", this.totaltampilkategori);
    param.append("idselected", this.idselectedkategori);
  
    const headers = new HttpHeaders({
      sesiidakun: this.sesiidakun,
      sesiusername: this.sesiusername,
      Authorization: `Bearer ${this.sesitoken}`,
    });
  
    try {
      const data = this.api.postData(param, "selectkategoribarang", { headers }, queryParams);
      const res: any = await lastValueFrom(data);
  
      this.collectionSizekategori = Math.ceil(parseInt(res.total) / parseInt(res.length));
  
      if (res.status === 1) {
        this.messageService.add({
          severity: "error",
          summary: res.pesan,
          detail: "Akses Anda ditolak!",
        });
        this.auth.logout();
      } else if (res.status === 99) {
        this.loadingselect = false;
        this.totalkategori = res.total;
        this.totaltampilkategori = res.length;
        this.maxpagekategori = res.pagerows;
        if (this.pagekategori === 1) {
          this.isidatakategori = res.hasil;
        } else {
          for (const isi of res.hasil) {
            this.isidatakategori = [...this.isidatakategori, { idkategoribarang: isi.idkategoribarang, kategoribarang: isi.kategoribarang, gambarkategoribarang: isi.gambarkategoribarang }];
          }
        }
      }
    } catch (err) {
      if (err.status === 401) {
        this.api.error(err);
        setTimeout(() => {
          this.loadStorage();
          this.selectKategori();
        }, 300);
      } else {
        this.api.error(err);
        this.gagalPost(1, "");
      }
    } finally {
      this.loadingselect = false;
    }
  }
  

  async konfirmHapus(id, target) {
    this.idbarang = id.idbarang;
    this.confirmationService.confirm({
      target: target,
      message: "yakin ingin menghapus " + id.namabarang + "?",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Hapus",
      rejectLabel: "Batal",
      dismissableMask: true,
      key: id.idbarang,
      acceptButtonStyleClass: "p-button-danger",
      accept: () => {
        this.hapusData(id.idbarang);
      },
      reject: () => {},
    });
  }

  //form
  async formKosong() {
    this.formBarang.get("namabarang").reset();
    this.formBarang.get("idkategoribarang").reset();
    this.formBarang.get("kodebarang").reset();
    this.formBarang.get("nopo").reset();
    this.formBarang.get("pcsperkarton").reset();
    this.formBarang.get("stokkarton").reset();
    this.formBarang.get("stokpcs").reset();
    this.formBarang.get("hargabeli").reset();
    this.formBarang.get("hargajual").reset();
    this.uploadGambar = [];
    if (this.fileUpload !== undefined) {
      this.fileUpload.clear();
    }
    if (this.selectedFiles.get(1) !== undefined) {
      this.selectedFiles.delete(1);
    }
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
      this.dataList(this.idbarang);
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
      this.dataList(p1.idbarang);
      this.popForm = true;
      this.namaForm = "Perbarui Data Barang";
      this.idbarang = p1.idbarang;
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

  async imgTambah(e) {
    this.uploadGambar = e.currentFiles;
  }

  async imgBaru(event: any, idgambar: number) {
    const fileInput: HTMLInputElement = event.target;
    if (fileInput.files && fileInput.files.length > 0) {
      const selectedFile: File = fileInput.files[0];
      this.selectedFiles.set(idgambar, selectedFile);
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.newImg.set(idgambar, e.target.result);
      };
      reader.readAsDataURL(selectedFile);
      if (selectedFile && !this.idgambar.includes(idgambar)) {
        this.idgambar.push(idgambar);
      }
    }
  }

  async removeFile(file: File, uploader: FileUpload) {
    const indexFile = uploader.files.indexOf(file);
    uploader.remove(event, indexFile);
  }

  async removeFileisi(i) {
    if (this.selectedFiles.get(1) !== undefined) {
      this.selectedFiles.delete(1);
    }
  }

  //select event

  async openSelectkategori(){
    this.isidatakategori = [];
    this.pagekategori = 1;
    this.carikategori = "";
    this.selectKategori()
  }

  async getSelectkategori(e){
    if (!e){
      this.idkategoribarang = e;
      this.idselectedkategori = e;
    } else {
      this.idkategoribarang = e.idkategoribarang;
      this.idselectedkategori = e.idkategoribarang;
    }
  }

  async cariDatakategori(e){
    this.carikategori = e.term;
    this.pagekategori = 1;
    this.selectKategori()
  }
  
  async scrollendSelectkategori(){
    if (this.maxpagekategori == this.pagekategori){
      return
    } else {
      this.pagekategori = parseInt(this.pagekategori) + 1;
      this.selectKategori();
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
