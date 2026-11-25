import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TeaEntry, TeaService, TeaSummary } from './tea.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <main class="container py-4 py-lg-5">
    <header class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div><div class="eyebrow">OFFICE / TEAM TRACKER</div><h1 class="mb-1">Tea Consumption</h1><p class="text-secondary mb-0">Keep a simple monthly record of everyone's tea.</p></div>
      <button class="btn btn-success px-4" (click)="resetForm()">+ Add tea entry</button>
    </header>

    <section class="row g-3 mb-4">
      <div class="col-12 col-md-4"><div class="stat-card"><span>Total teas this month</span><strong>{{ summary.totalTea }}</strong><small>cups recorded</small></div></div>
      <div class="col-6 col-md-4"><div class="stat-card"><span>People</span><strong>{{ summary.peopleCount }}</strong><small>unique names</small></div></div>
      <div class="col-6 col-md-4"><div class="stat-card"><span>Entries</span><strong>{{ summary.entryCount }}</strong><small>records this month</small></div></div>
    </section>

    <section class="panel p-3 p-md-4 mb-4">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
        <div><h2 class="h5 mb-1">Monthly records</h2><p class="text-secondary small mb-0">Choose a month to see its tea consumption.</p></div>
        <div class="d-flex flex-wrap gap-2">
          <input class="form-control" style="width:145px" type="month" [(ngModel)]="monthValue" (change)="loadData()">
          <input class="form-control" style="width:190px" placeholder="Search person..." [(ngModel)]="search" (input)="loadEntries()">
          <button class="btn btn-outline-success" (click)="exportCsv()" [disabled]="!entries.length">Export CSV</button>
        </div>
      </div>
      <div class="table-responsive">
        <table class="table align-middle">
          <thead><tr><th>Date</th><th>Person</th><th class="text-end">Tea count</th><th>Remarks</th><th class="text-end">Actions</th></tr></thead>
          <tbody>
            <tr *ngFor="let item of entries">
              <td>{{ item.date | date:'dd MMM yyyy' }}</td><td class="fw-semibold">{{ item.personName }}</td>
              <td class="text-end"><span class="count-pill">{{ item.count }}</span></td><td class="text-secondary">{{ item.remarks || '—' }}</td>
              <td class="text-end text-nowrap"><button class="btn btn-sm btn-light me-1" (click)="edit(item)">Edit</button><button class="btn btn-sm btn-outline-danger" (click)="remove(item)">Delete</button></td>
            </tr>
            <tr *ngIf="!entries.length"><td colspan="5" class="text-center py-5 text-secondary">No tea entries for this filter yet.</td></tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="row g-3">
      <div class="col-12 col-lg-7"><div class="panel p-3 p-md-4 h-100">
        <h2 class="h5 mb-3">Person-wise summary</h2>
        <div *ngFor="let person of summary.byPerson" class="person-row">
          <div><strong>{{ person.personName }}</strong><small class="d-block text-secondary">{{ person.entries }} entries</small></div>
          <strong>{{ person.totalTea }} cups</strong>
        </div>
        <p *ngIf="!summary.byPerson.length" class="text-secondary mb-0">Your person-wise summary will appear here.</p>
      </div></div>
      <div class="col-12 col-lg-5"><div class="panel p-3 p-md-4">
        <h2 class="h5 mb-3">{{ form._id ? 'Edit entry' : 'Add new entry' }}</h2>
        <form (ngSubmit)="save()" #entryForm="ngForm">
          <label class="form-label">Person name</label><input class="form-control mb-3" name="personName" [(ngModel)]="form.personName" required maxlength="80" placeholder="e.g. Rahul">
          <label class="form-label">Date</label><input class="form-control mb-3" type="date" name="date" [(ngModel)]="form.date" [max]="today" required>
          <label class="form-label">Number of teas</label><input class="form-control mb-3" type="number" name="count" [(ngModel)]="form.count" required min="0" step="1">
          <label class="form-label">Remarks <span class="text-secondary">(optional)</span></label><input class="form-control mb-3" name="remarks" [(ngModel)]="form.remarks" maxlength="250" placeholder="Any note...">
          <div class="d-flex gap-2"><button class="btn btn-success flex-grow-1" [disabled]="entryForm.invalid">{{ form._id ? 'Update entry' : 'Save entry' }}</button><button type="button" class="btn btn-light" (click)="resetForm()">Clear</button></div>
        </form>
        <p *ngIf="message" class="small mt-3 mb-0" [class.text-danger]="isError" [class.text-success]="!isError">{{ message }}</p>
      </div></div>
    </section>
    <footer class="text-center text-secondary small mt-4">Tea Consumption Tracker · MEAN Stack</footer>
  </main>`,
  styles: [`
    :host{display:block;min-height:100vh;background:#f5f7f5;color:#203129}
    h1{font-size:clamp(1.8rem,4vw,2.5rem);font-weight:750;letter-spacing:-1.2px}
    .eyebrow{font-size:.7rem;letter-spacing:1.7px;font-weight:700;color:#238052;margin-bottom:7px}
    .stat-card,.panel{background:#fff;border:1px solid #e8eee9;border-radius:16px;box-shadow:0 5px 20px #183b2510}
    .stat-card{padding:20px 22px;display:flex;flex-direction:column;gap:4px}
    .stat-card span,.stat-card small{color:#718078;font-size:.85rem}.stat-card strong{font-size:2rem;line-height:1.2}
    .count-pill{display:inline-block;background:#e8f5ed;color:#167345;border-radius:20px;padding:4px 12px;font-weight:700}
    .table thead th{font-size:.75rem;text-transform:uppercase;letter-spacing:.5px;color:#7a8980;border-bottom-color:#e9efeb}
    .table td{padding-top:13px;padding-bottom:13px}.person-row{display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid #edf1ee}.person-row:last-child{border:0}
    .form-control{border-color:#dce5de;padding:.65rem .8rem}.form-control:focus{border-color:#369568;box-shadow:0 0 0 .2rem #36956820}
    .btn-success{background:#218653;border-color:#218653}.btn-success:hover{background:#176c41}
    @media(max-width:575px){.stat-card{padding:15px}.stat-card strong{font-size:1.6rem}}
  `]
})
export class AppComponent implements OnInit {
  private teaService = inject(TeaService);
  today: string = new Date().toISOString().split('T')[0];
  monthValue = new Date().toISOString().slice(0, 7);
  search = '';
  entries: TeaEntry[] = [];
  summary: TeaSummary = { totalTea: 0, entryCount: 0, peopleCount: 0, byPerson: [] };
  form: TeaEntry = this.emptyForm();
  message = '';
  isError = false;

  ngOnInit() { this.loadData(); }
  private emptyForm(): TeaEntry {
    return { personName: '', date: new Date().toISOString().slice(0, 10), count: 1, remarks: '' };
  }
  private selectedMonth() {
    const [year, month] = this.monthValue.split('-').map(Number);
    return { year, month };
  }
  loadData() { this.loadEntries(); this.loadSummary(); }
  loadEntries() {
    const { year, month } = this.selectedMonth();
    this.teaService.getEntries(month, year, this.search).subscribe({
      next: r => this.entries = r.data,
      error: () => this.showMessage('Could not load entries. Check that the backend is running.', true)
    });
  }
  loadSummary() {
    const { year, month } = this.selectedMonth();
    this.teaService.getSummary(month, year).subscribe({
      next: r => this.summary = r.data,
      error: () => this.showMessage('Could not load monthly summary.', true)
    });
  }
  save() {
    const payload = { ...this.form, count: Number(this.form.count) };
    const request = this.form._id ? this.teaService.update(this.form._id, payload) : this.teaService.add(payload);
    request.subscribe({
      next: () => { this.showMessage(this.form._id ? 'Entry updated successfully.' : 'Tea entry added successfully.'); this.resetForm(); this.loadData(); },
      error: e => this.showMessage(e.error?.message || 'Unable to save entry.', true)
    });
  }
  edit(item: TeaEntry) { this.form = { ...item, date: new Date(item.date).toISOString().slice(0, 10) }; this.message = ''; }
  remove(item: TeaEntry) {
    if (!item._id || !confirm(`Delete tea entry for ${item.personName}?`)) return;
    this.teaService.delete(item._id).subscribe({
      next: () => { this.showMessage('Entry deleted.'); this.loadData(); },
      error: () => this.showMessage('Unable to delete entry.', true)
    });
  }
  resetForm() { this.form = this.emptyForm(); this.message = ''; }
  showMessage(message: string, error = false) { this.message = message; this.isError = error; }
  exportCsv() {
    const headers = ['Date', 'Person', 'Tea Count', 'Remarks'];
    const rows = this.entries.map(x => [new Date(x.date).toLocaleDateString('en-IN'), x.personName, x.count, x.remarks || '']);
    const csv = [headers, ...rows].map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = `tea-records-${this.monthValue}.csv`; link.click();
    URL.revokeObjectURL(url);
  }
}
