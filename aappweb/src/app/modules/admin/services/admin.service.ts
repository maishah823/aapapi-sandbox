import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from '../../../../environments/environment';
import {Address} from '@shared/classes/Address';
import {User} from '@shared/classes';

@Injectable()
export class AdminService {

  constructor(private http: HttpClient) {
  }

  logs(page?: number, limit?: number, type?: string) {
    let guarenteedPage = page || 1;
    let guarenteedLimit = limit || 10;
    var query = `?page=${guarenteedPage}&limit=${guarenteedLimit}`;
    if (type) {
      query = query + `&type=${type}`;
    }
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/logs' + query, {headers});
  }

  categories() {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/logs/categories', {headers});
  }

  applications(filter: string, page?: number, limit?: number) {
    let guarenteedPage = page || 1;
    let guarenteedLimit = limit || 10;
    var query = `?page=${guarenteedPage}&limit=${guarenteedLimit}`;
    if (filter) {
      query = query + '&filter=' + filter;
    }
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/applications' + query, {headers});
  }

  regionalApplications(region: string) {
    var query;
    query = query = '?region=all';
    if (region) {
      query = '?region=' + region;
    }
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/applications/regional' + query, {headers});
  }

  applicationDetail(id) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/applications/detail/' + id, {headers});
  }

  downloadApplication(id) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/applications/pdf/' + id, {headers, responseType: 'blob'});
  }

  approve(id) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/applications/approve/' + id, {headers});
  }

  deny(id, reason) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post(environment.API_URI + '/applications/deny/' + id, {reason}, {headers});
  }


  getUsers(page?: number, limit?: number, type?: string, searchTerm?: string, showSuspended?: boolean) {
    let guarenteedPage = page || 1;
    let guarenteedLimit = limit || 10;
    var query = `?page=${guarenteedPage}&limit=${guarenteedLimit}`;
    if (type) {
      query = query + `&type=${type}`;
    }
    if (searchTerm) {
      query = query + `&search=${searchTerm}`;
    }
    if (showSuspended) {
      query = query + '&suspended=true';
    }
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/users/list' + query, {headers});
  }

  getUsersWithInvoices(page?: number, limit?: number, searchTerm?: string) {
    let guarenteedPage = page || 1;
    let guarenteedLimit = limit || 10;
    var query = `?page=${guarenteedPage}&limit=${guarenteedLimit}`;

    if (searchTerm) {
      query = query + `&search=${searchTerm}`;
    }

    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/financial/invoices-by-name' + query, {headers});
  }

  removeSchoolAdmin(userId) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/users/remove-school-admin/' + userId, {headers});
  }

  addSchoolAdminPermission(userId: string, school: string) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post(environment.API_URI + '/users/add-school-admin', {userId, school}, {headers});
  }

  makeAdmin(userId: string) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post(environment.API_URI + '/users/make-admin', {userId}, {headers});
  }

  revokeAdmin(userId: string) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post(environment.API_URI + '/users/revoke-admin', {userId}, {headers});
  }

  suspendUser(userId: string) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post(environment.API_URI + '/users/suspend', {userId}, {headers});
  }

  toggleDelinquentDues(userId: string, status: boolean) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post(environment.API_URI + '/users/toggle-delinquent-dues-status', {userId, status}, {headers});
  }

  reinstateUser(userId: string) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post(environment.API_URI + '/users/reinstate', {userId}, {headers});
  }

  resetPassword(userId: string, password: string) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post(environment.API_URI + '/users/reset-password', {userId, password}, {headers});
  }

  makeRegionalManager(userId: string) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post(environment.API_URI + '/users/make-regional-manager', {userId}, {headers});
  }

  revokeRegionalManager(userId: string) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post(environment.API_URI + '/users/revoke-regional-manager', {userId}, {headers});
  }

  makeInstructor(userId: string) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post(environment.API_URI + '/users/make-instructor', {userId}, {headers});
  }

  revokeInstructor(userId: string) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post(environment.API_URI + '/users/revoke-instructor', {userId}, {headers});
  }

  getTopics() {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/conf-admin/topics', {headers});
  }

  getGuestLists() {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/conf-admin/guestlists', {headers});
  }

  getConfStats() {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/conf-admin/conf-stats', {headers});
  }

  getAttendees(page?: number, limit?: number, searchTerm?: string, noshow?: boolean) {
    let guarenteedPage = page || 1;
    let guarenteedLimit = limit || 10;
    var query = `?page=${guarenteedPage}&limit=${guarenteedLimit}`;
    if (searchTerm) {
      query = query + `&search=${searchTerm}`;
    }
    if (noshow) {
      query = query + `&filter=${noshow}`;
    }
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/conf-admin/attendees' + query, {headers});
  }

  getAttendeesForCheckIn(page?: number, limit?: number, searchTerm?: string) {
    let guarenteedPage = page || 1;
    let guarenteedLimit = limit || 10;
    var query = `?page=${guarenteedPage}&limit=${guarenteedLimit}`;
    if (searchTerm) {
      query = query + `&search=${searchTerm}`;
    }
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/conf-admin/attendees-for-check-in' + query, {headers});
  }

  addTopic(topic) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post(environment.API_URI + '/conf-admin/topics', {topic}, {headers});
  }

  getInstructors(page, limit, search) {
    let guarenteedPage = page || 1;
    let guarenteedLimit = limit || 10;
    var query = `?page=${guarenteedPage}&limit=${guarenteedLimit}`;
    if (search) {
      query = query + `&search=${search}`;
    }
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/conf-admin/instructors' + query, {headers});
  }

  addInstructor(instructor) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post(environment.API_URI + '/conf-admin/add-instructor', {instructor}, {headers});
  }

  getClassroomEvents() {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/conference/classroom-events', {headers});
  }

  getSingleClassroomEvent(id) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/conference/classroom-events/edit/' + id, {headers});
  }

  getEvents() {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/conference/events', {headers});
  }

  getSingleEvent(id) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/conference/events/edit/' + id, {headers});
  }

  bulkEmail(payload) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post(environment.API_URI + '/email/bulk', {payload}, {headers});
  }

  getActiveCoupons() {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/attend/coupons/active', {headers});
  }

  createCoupon(coupon) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post(environment.API_URI + '/attend/coupons/add', {coupon}, {headers});
  }

  getInvoices(page?: number, limit?: number, searchTerm?: string, filter?: string) {
    let guarenteedPage = page || 1;
    let guarenteedLimit = limit || 10;
    var query = `?page=${guarenteedPage}&limit=${guarenteedLimit}`;
    if (searchTerm) {
      query = query + `&search=${searchTerm}`;
    }
    if (filter) {
      query = query + `&filter=${filter}`;
    }
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/financial/invoices' + query, {headers});
  }

  getSingleInvoice(invoiceId: string) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/financial/invoices/' + invoiceId, {headers});
  }

  getFinancialStats() {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/financial/financial-stats', {headers});
  }

  getConfRevenue(confId) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/financial/conf-revenue/' + confId, {headers});
  }

  makeManualPayment(paymentInfo) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post(environment.API_URI + '/financial/manual-payment', {paymentInfo}, {headers});
  }

  getBlogs(page?: number, limit?: number) {
    let guarenteedPage = page || 1;
    let guarenteedLimit = limit || 10;
    var query = `?page=${guarenteedPage}&limit=${guarenteedLimit}`;
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/blogs' + query, {headers});
  }

  addBlog(post: Object) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post(environment.API_URI + '/blogs', {post}, {headers});
  }

  getSignedBlogURL(file: File, newFileName: String) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post(environment.API_URI + '/blogs/upload-sign', JSON.stringify({
      filename: newFileName,
      contenttype: file.type
    }), {headers});
  }

  uploadBlogImage(url: string, file: any) {
    const headers = new HttpHeaders({'Content-Type': file.type, 'External': 'true'});
    return this.http.put(url, file, {headers, reportProgress: true});
  }

  approveAttendee(userId) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post(environment.API_URI + '/conf-admin/approve', {userId}, {headers});
  }

  rejectAttendee(userId, reason) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post(environment.API_URI + '/conf-admin/reject', {userId, reason}, {headers});
  }

  checkInAttendee(userId, textAuth, phone?) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post(environment.API_URI + '/conf-admin/checkin', {userId, textAuth, phone}, {headers});
  }

  getVendors() {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/conf-admin/reps', {headers});
  }

  approveRep(repId) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post(environment.API_URI + '/conf-admin/approveRep', {repId}, {headers});
  }

  rejectRep(repId, reason) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post(environment.API_URI + '/conf-admin/rejectRep', {repId, reason}, {headers});
  }

  getCurrentRatings(conf?: string) {
    var query = '';
    if (conf) {
      query = `?conf=${conf}`;
    }
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/checkout/stats-overview' + query, {headers});
  }

  getComments(page?: number, limit?: number, filter?: string) {
    let guarenteedPage = page || 1;
    let guarenteedLimit = limit || 10;
    var query = `?page=${guarenteedPage}&limit=${guarenteedLimit}`;
    if (filter) {
      query = query + '&filter=' + filter;
    }
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/checkout/comments' + query, {headers});
  }

  getSystemStats() {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/system/system-stats', {headers});
  }

  getVersionHistory(page, limit) {
    let guarenteedPage = page || 1;
    let guarenteedLimit = limit || 10;
    var query = `?page=${guarenteedPage}&limit=${guarenteedLimit}`;

    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/system/version-history' + query, {headers});
  }

  changeLevel(userId: string, level: string) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post(environment.API_URI + '/users/change-level', {userId, level}, {headers});
  }

  getRsvps() {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/conf-admin/rsvps', {headers});
  }

  adjustInvoice(invoiceId, type, amount, note) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post(environment.API_URI + '/financial/adjust-invoice', {invoiceId, type, amount, note}, {headers});
  }

  updateUsersAddress(userId: string, address: Address) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post(environment.API_URI + '/users/update-users-address', {userId, address}, {headers});
  }

  updateCertNumber(userId: string, certNumber: string) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post(environment.API_URI + '/users/update-cert-number', {userId, certNumber}, {headers});
  }

  updateCertYear(userId: string, certYear: string) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post(environment.API_URI + '/users/update-cert-year', {userId, certYear}, {headers});
  }

  getSingleBlog(blogId) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/blogs/single/' + blogId, {headers});
  }

  deleteEvent(eventId: string) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/conf-admin/delete-event/' + eventId, {headers});
  }

  deleteClass(eventId: string) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/conf-admin/delete-class/' + eventId, {headers});
  }

  //DEV
  manualMember(user: User) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post(environment.API_URI + '/system/manualmember', {user}, {headers});
  }

  refundAttendee(attendeeId) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post(environment.API_URI + '/conf-admin/refund-attendee', {attendeeId}, {headers});
  }

  searchForDuplicateUsers(lastName) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post(environment.API_URI + '/conf-admin/duplicate-search', {lastName}, {headers});
  }

  linkMember(newId, realId) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post(environment.API_URI + '/conf-admin/link-member', {newId, realId}, {headers});
  }

  createArbitraryInvoice(userId, amount, description, type) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post(environment.API_URI + '/financial/arbitrary-invoice', {userId, amount, description, type}, {headers});
  }

  triggerDuesReminders() {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/financial/trigger-dues-reminders', {headers});
  }

  generateYearlyDues() {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/financial/generate-yearly-dues', {headers});
  }

  triggerCheckoutReminders() {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/conf-admin/trigger-checkout-reminders', {headers});
  }

  clearAllRegistrations() {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/conf-admin/clear-registrations', {headers});
  }

  bulkAttendeeSMS(message) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post(environment.API_URI + '/sms/bulk-attendees', {message}, {headers});
  }

  bulkAdminsSMS(message) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post(environment.API_URI + '/sms/bulk-admins', {message}, {headers});
  }

  updateEmail(userId: string, email: string) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post(environment.API_URI + '/users/adminUpdateEmail', {userId, email}, {headers});

  }

  updateName(userId: string, firstName: string, lastName: string) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post(environment.API_URI + '/users/adminUpdateName', {userId, firstName, lastName}, {headers});

  }

  getHoursLogs(page?: number, limit?: number, conf?: string, searchTerm?: string, filter?: string) {
    let guarenteedPage = page || 1;
    let guarenteedLimit = limit || 10;
    var query = `?page=${guarenteedPage}&limit=${guarenteedLimit}`;
    if (searchTerm) {
      query = query + `&search=${searchTerm}`;
    }
    if (filter) {
      query = query + `&filter=${filter}`;
    }
    if (conf) {
      query = query + `&conf=${conf}`;
    }

    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/checkout/hours-logs' + query, {headers});
  }

  downloadBluesheet(id) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post(environment.API_URI + '/checkout/generate-bluesheet', {id, type: 'download'}, {headers, responseType: 'blob'});
  }

  emailBluesheet(id) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post(environment.API_URI + '/checkout/generate-bluesheet', {id, type: 'email'}, {headers});
  }

  commentsByClass(classId: string, type: string) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post(environment.API_URI + '/checkout/comments-by-class', {classId, type}, {headers});

  }

  getGeneralComments(page?: number, limit?: number, conf?: string) {
    let guarenteedPage = page || 1;
    let guarenteedLimit = limit || 10;
    var query = `?page=${guarenteedPage}&limit=${guarenteedLimit}`;
    if (conf) {
      query = query + `&conf=${conf}`;
    }
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/checkout/general-comments' + query, {headers});

  }

}
