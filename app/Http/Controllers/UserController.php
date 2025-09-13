<?php

namespace App\Http\Controllers;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use PHPUnit\Framework\Constraint\Count;

class UserController extends Controller
{
    public function adminView(){
        // if(Auth::check()){
        //     return view('admin');
        // }
        // else{
        //     return redirect()->route('login');
        // }
        return view('admin');
    }
    public function userList(){
        $user=DB::table('users')->orderByDesc('id')->paginate(8);
        return view('users/adminUsers',['user'=>$user]);
    }

    public function createUser(Request $req){
        $user1=DB::table('users')->insert([
            'user_name'=>$req->username,
            'email'=>$req->email,
            'password'=>Hash::make($req->password),
            'role'=>$req->role,
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now()
        ]);
        
        return redirect()->route('users');
    }

    public function deleteUser(string $id){
        $user=DB::table('users')->where('id',$id)->delete();
        return view('users.userDelete',['user'=>$user]);
    }
    public function showUpdateUser(string $id){
        $showUser=DB::table('users')->where('id',$id)->get();
        return view('users.updateUser',['user'=>$showUser]);
    }
    public function updateUser(Request $req, string $id){
        $data = [
            'user_name' => $req->username,
            'email'     => $req->email,
            'role'      => $req->role,
            'updated_at'=> Carbon::now()
        ];
    
        if ($req->filled('password')) {
            $data['password'] = Hash::make($req->password);
        }
    
        DB::table('users')->where('id', $id)->update($data);
    
        return redirect()->route('users');
    }
    
    public function loginUser(Request $req){
        $credentials=$req->validate([
            'email'=>'required | email',
            'password'=>'required'
        ]);
        if (Auth::attempt($credentials)) {
            return redirect()->route('dashboard');
        } else {
            return back()->withErrors([
                'loginError' => 'The provided credentials do not match our records.',
            ])->withInput(); // Keeps entered email in the input field
        }
    }

    public function logoutUser(){
        Auth::logout();
        return redirect()->route('login');
    }

    public function  loginPage() {
        return view('users.login');
    }
    public function form(){
        return view('users.addUser');
    }
    public function userFolder(){
        $userData=DB::table('users')
        ->leftJoin('videos','users.id','=','videos.user_id')
        ->select(
            'users.id as id',
            'users.user_name as user_name',
            DB::raw('COUNT(videos.id) as total_videos'),
            DB::raw('SUM(CASE WHEN videos.status = "Completed" THEN 1 ELSE 0 END) as completed_videos')
        )
        ->groupBy('users.id', 'users.user_name')->get();
        return view('users.userFolder',[
            'userData'=>$userData,
        ]);
    }

    public function showUserDetail(string $id){
        $user=DB::table('users')->where([['users.id',$id],['users.role','=','Coache']])
        ->leftJoin('videos','users.id','=','videos.user_id')
        ->select(
            'users.id as id',
            'users.user_name as user_name',
            'users.email as email',
            'users.created_at as joined',
            DB::raw('SUM(CASE WHEN videos.status = "Completed" THEN 1 ELSE 0 END) as completed_videos'),
            DB::raw('SUM(CASE WHEN videos.status = "In progress" THEN 1 ELSE 0 END) as progress_videos'),
            DB::raw('COUNT(videos.id) as total_videos')
        )
        ->groupBy('users.id', 'users.user_name', 'users.email','users.created_at')
        ->take(1)->get();

        $videoDetail=DB::table('videos')->where('user_id',$id)->get();
        return view('users.userDetail',['user'=>$user,'video'=>$videoDetail]);
    }

    public function videoDetailEditPage(string $id){
        $videoDetail=DB::table('videos')->where('id',$id)->take(1)->get();

        return view('games.videoDetailEdit',['video'=>$videoDetail]);
    }

    public function videoUpdate(Request $req,string $id){
        $data = [
            'title' => $req->videoTitle,
            'status'     => $req->videoStatus,
            'updated_at'=> Carbon::now()
        ];
    
        DB::table('videos')->where('id', $id)->update($data);
    
        return redirect()->route('user-folder');
    }
    public function videoDelete(string $id){
        DB::table('videos')->where('id', $id)->delete();
    
        return redirect()->route('user-folder');
    }
}



