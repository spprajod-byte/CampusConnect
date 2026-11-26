
import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';

import {
  Provider as PaperProvider,
  MD3LightTheme,
  Button,
  Text,
  TextInput,
  Card,
  Avatar,
  Surface,
  Divider,
} from 'react-native-paper';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
} from 'firebase/auth';

import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';

import { auth, db } from './firebase';

const Stack = createNativeStackNavigator();
const BLUE = '#2457D6';

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: BLUE,
    secondary: '#6387E8',
    background: '#F4F7FC',
    surface: '#FFFFFF',
  },
};

// SPLASH SCREEN
function SplashScreen() {
  return (
    <View style={styles.splash}>
      <Surface style={styles.logoCircle} elevation={3}>
        <Ionicons name="school" size={65} color={BLUE} />
      </Surface>

      <Text variant="headlineLarge" style={styles.splashTitle}>
        CampusConnect
      </Text>

      <Text style={styles.splashSubtitle}>
        Your College. Your Campus. One App.
      </Text>

      <Text style={styles.loading}>Loading...</Text>
    </View>
  );
}

// LOGIN SCREEN
function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Missing Details', 'Please enter email and password.');
      return;
    }

    try {
      setBusy(true);

      await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
    } catch (error) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.authContent}>
        <Avatar.Icon
          size={85}
          icon="school"
          style={styles.avatar}
        />

        <Text variant="headlineMedium" style={styles.heading}>
          Welcome Back!
        </Text>

        <Text style={styles.muted}>
          Login to your CampusConnect account
        </Text>

        <TextInput
          label="Email Address"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
          left={<TextInput.Icon icon="email" />}
        />

        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          mode="outlined"
          secureTextEntry
          style={styles.input}
          left={<TextInput.Icon icon="lock" />}
        />

        <Button
          mode="contained"
          onPress={handleLogin}
          loading={busy}
          disabled={busy}
          style={styles.mainButton}
          contentStyle={styles.buttonContent}
        >
          LOGIN
        </Button>

        <Button
          mode="text"
          onPress={() => navigation.navigate('Register')}
        >
          Don't have an account? Register
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

// REGISTRATION SCREEN
function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert('Missing Details', 'Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        'Weak Password',
        'Password must contain at least 6 characters.'
      );
      return;
    }

    try {
      setBusy(true);

      const result = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      await updateProfile(result.user, {
        displayName: name.trim(),
      });

      // Firebase automatically signs in the new user.
    } catch (error) {
      Alert.alert('Registration Failed', error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.authContent}>
        <Avatar.Icon
          size={75}
          icon="account-plus"
          style={styles.avatar}
        />

        <Text variant="headlineMedium" style={styles.heading}>
          Create Account
        </Text>

        <Text style={styles.muted}>
          Join the CampusConnect community
        </Text>

        <TextInput
          label="Full Name"
          value={name}
          onChangeText={setName}
          mode="outlined"
          autoCapitalize="words"
          style={styles.input}
          left={<TextInput.Icon icon="account" />}
        />

        <TextInput
          label="Email Address"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
          left={<TextInput.Icon icon="email" />}
        />

        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          mode="outlined"
          secureTextEntry
          style={styles.input}
          left={<TextInput.Icon icon="lock" />}
        />

        <Button
          mode="contained"
          onPress={handleRegister}
          loading={busy}
          disabled={busy}
          style={styles.mainButton}
          contentStyle={styles.buttonContent}
        >
          REGISTER
        </Button>

        <Button onPress={() => navigation.goBack()}>
          Already have an account? Login
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

// HOME SCREEN
function HomeScreen({ navigation, user }) {
  const features = [
    {
      title: 'College Events',
      subtitle: 'Discover upcoming events',
      icon: 'calendar',
      screen: 'Events',
    },
    {
      title: 'My Notes',
      subtitle: 'Save your important notes',
      icon: 'book-open-variant',
      screen: 'Notes',
    },
    {
      title: 'My Profile',
      subtitle: 'View your student profile',
      icon: 'account-circle',
      screen: 'Profile',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.muted}>WELCOME TO</Text>
            <Text variant="headlineMedium" style={styles.heading}>
              CampusConnect
            </Text>
          </View>

          <Avatar.Icon
            size={52}
            icon="school"
            style={styles.avatar}
          />
        </View>

        <Surface style={styles.welcomeCard} elevation={2}>
          <Text variant="titleLarge" style={{ color: '#FFFFFF' }}>
            Hello, {user.displayName || 'Student'}! 👋
          </Text>

          <Text style={styles.welcomeText}>
            Everything you need for your college life, in one place.
          </Text>
        </Surface>

        <Text variant="titleLarge" style={styles.sectionTitle}>
          Explore Features
        </Text>

        {features.map((item) => (
          <Card
            key={item.screen}
            style={styles.featureCard}
            onPress={() => navigation.navigate(item.screen)}
          >
            <Card.Content style={styles.featureContent}>
              <Avatar.Icon
                size={50}
                icon={item.icon}
                style={styles.featureIcon}
              />

              <View style={{ flex: 1 }}>
                <Text variant="titleMedium">{item.title}</Text>
                <Text style={styles.muted}>{item.subtitle}</Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={22}
                color={BLUE}
              />
            </Card.Content>
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

// EVENTS SCREEN


// EVENTS SCREEN



function EventsScreen() {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const campusUpdates = [
    {
      title: 'Cultural Fest Registration',
      body: 'Registrations are now open for the annual college cultural fest. Interested students can register with their department coordinators.'
    },
    {
      title: 'Internal Examination',
      body: 'The internal examination timetable will be announced soon. Students are advised to start their preparations.'
    },
    {
      title: 'Assignment Submission',
      body: 'All students are requested to complete and submit their assignments before the deadline.'
    },
    {
      title: 'Sports Day Registration',
      body: 'Students interested in participating in college sports events can register with the sports department.'
    },
    {
      title: 'Placement Training',
      body: 'Placement training sessions will begin next week. All eligible students are encouraged to participate.'
    },
    {
      title: 'Library Notice',
      body: 'Students are requested to return borrowed library books on or before their due dates.'
    },
    {
      title: 'Workshop Announcement',
      body: 'A technical workshop will be organized for students. Further details will be shared soon.'
    },
    {
      title: 'Attendance Reminder',
      body: 'Students are reminded to maintain the required attendance percentage in all subjects.'
    },
    {
      title: 'Project Submission',
      body: 'Final-year students are requested to complete their mini-project documentation and submit it on time.'
    },
    {
      title: 'College Event',
      body: 'Stay connected with CampusConnect for upcoming college activities, events and announcements.'
    }
  ];

  const loadUpdates = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(
        'https://jsonplaceholder.typicode.com/posts?_limit=10'
      );

      if (!response.ok) {
        throw new Error('Unable to fetch updates.');
      }

      const data = await response.json();

      setUpdates(
        data.map((item, index) => ({
          id: item.id,
          ...campusUpdates[index]
        }))
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUpdates();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.page}>
        <Text variant="headlineMedium" style={styles.heading}>
          Campus Updates
        </Text>

        <Text style={styles.muted}>
          Stay informed about college news and announcements.
        </Text>

        <Text style={styles.sectionTitle}>
          Latest Announcements
        </Text>

        {loading ? (
          <Text style={styles.muted}>Loading updates...</Text>
        ) : error ? (
          <>
            <Text style={styles.muted}>{error}</Text>
            <Button mode="contained" onPress={loadUpdates}>
              TRY AGAIN
            </Button>
          </>
        ) : (
          updates.map((item) => (
            <Card
              key={item.id}
              style={styles.featureCard}
            >
              <Card.Content>
                <Text variant="labelMedium" style={styles.muted}>
                  ANNOUNCEMENT #{item.id}
                </Text>

                <Text variant="titleMedium">
                  {item.title}
                </Text>

                <Text style={{ marginTop: 8 }}>
                  {item.body}
                </Text>
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}





// NOTES SCREEN
function NotesScreen({ user }) {
  const [note, setNote] = useState('');
  const [notes, setNotes] = useState([]);
  const [busy, setBusy] = useState(false);

  // Fetch notes from Firestore
  useEffect(() => {
    const notesQuery = query(
      collection(db, 'notes'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(
      notesQuery,
      (snapshot) => {
        setNotes(
          snapshot.docs.map((item) => ({
            id: item.id,
            ...item.data()
          }))
        );
      },
      (error) => {
        Alert.alert('Error', error.message);
      }
    );

    return unsubscribe;
  }, [user.uid]);

  // Save note
  const saveNote = async () => {
    if (!note.trim()) {
      Alert.alert('Empty Note', 'Please write something first.');
      return;
    }

    try {
      setBusy(true);

      await addDoc(collection(db, 'notes'), {
        text: note.trim(),
        userId: user.uid,
        createdAt: serverTimestamp()
      });

      setNote('');
      Alert.alert('Success', 'Your note has been saved!');
    } catch (error) {
      Alert.alert('Save Failed', error.message);
    } finally {
      setBusy(false);
    }
  };

  // Delete note
  const removeNote = async (id) => {
    try {
      await deleteDoc(doc(db, 'notes', id));
    } catch (error) {
      Alert.alert('Delete Failed', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.page}>
        <Text variant="headlineMedium" style={styles.heading}>
          My Notes
        </Text>

        <Text style={styles.muted}>
          Keep your important college notes here.
        </Text>

        <TextInput
          label="Write your note"
          value={note}
          onChangeText={setNote}
          mode="outlined"
          multiline
          numberOfLines={4}
          style={styles.noteInput}
        />

        <Button
          mode="contained"
          style={styles.mainButton}
          onPress={saveNote}
          loading={busy}
          disabled={busy}
        >
          SAVE NOTE
        </Button>

        <Text variant="titleLarge" style={styles.sectionTitle}>
          Your Notes ({notes.length})
        </Text>

        {notes.length === 0 ? (
          <Text style={styles.muted}>
            No notes saved yet. Add your first note!
          </Text>
        ) : (
          notes.map((item) => (
            <Card key={item.id} style={styles.featureCard}>
              <Card.Content>
                <Text>{item.text}</Text>
              </Card.Content>

              <Card.Actions>
                <Button
                  textColor="#D32F2F"
                  icon="delete"
                  onPress={() => removeNote(item.id)}
                >
                  Delete
                </Button>
              </Card.Actions>
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}


// PROFILE SCREEN
function ProfileScreen({ user }) {
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      Alert.alert('Logout Failed', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.page}>
        <View style={styles.profileHeader}>
          <Avatar.Icon
            size={100}
            icon="account"
            style={styles.avatar}
          />

          <Text variant="headlineSmall" style={styles.heading}>
            {user.displayName || 'Student'}
          </Text>

          <Text style={styles.muted}>{user.email}</Text>
        </View>

        <Divider style={{ marginVertical: 20 }} />

        <Card style={styles.featureCard}>
          <Card.Content>
            <Text variant="titleMedium">My Account</Text>

            <Text style={styles.muted}>
              Your CampusConnect account is active.
            </Text>
          </Card.Content>
        </Card>

        <Button
          mode="outlined"
          textColor="#D32F2F"
          icon="logout"
          style={{ marginTop: 25 }}
          onPress={handleLogout}
        >
          LOGOUT
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

// MAIN APP
export default function App() {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setInitializing(false);
    });

    return unsubscribe;
  }, []);

  return (
    <PaperProvider theme={theme}>
      <StatusBar backgroundColor={BLUE} barStyle="light-content" />

      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: BLUE },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: { fontWeight: 'bold' },
            contentStyle: { backgroundColor: '#F4F7FC' },
          }}
        >
          {initializing ? (
            <Stack.Screen
              name="Splash"
              component={SplashScreen}
              options={{ headerShown: false }}
            />
          ) : user ? (
            <>
              <Stack.Screen name="Home" options={{ headerShown: false }}>
                {(props) => <HomeScreen {...props} user={user} />}
              </Stack.Screen>

              <Stack.Screen
                name="Events"
                component={EventsScreen}
              />

              <Stack.Screen name="Notes">
                {(props) => <NotesScreen {...props} user={user} />}
              </Stack.Screen>

              <Stack.Screen name="Profile">
                {(props) => <ProfileScreen {...props} user={user} />}
              </Stack.Screen>
            </>
          ) : (
            <>
              <Stack.Screen
                name="Login"
                component={LoginScreen}
                options={{ headerShown: false }}
              />

              <Stack.Screen
                name="Register"
                component={RegisterScreen}
                options={{ title: 'Registration' }}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

// STYLES
const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: BLUE,
    justifyContent: 'center',
    alignItems: 'center',
  },

  logoCircle: {
    width: 125,
    height: 125,
    borderRadius: 65,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginBottom: 22,
  },

  splashTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  splashSubtitle: {
    color: '#DCE6FF',
    marginTop: 8,
  },

  loading: {
    color: '#FFFFFF',
    marginTop: 45,
  },

  container: {
    flex: 1,
    backgroundColor: '#F4F7FC',
  },

  authContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },

  page: {
    padding: 20,
    paddingBottom: 35,
  },

  avatar: {
    backgroundColor: '#E4ECFF',
  },

  heading: {
    color: '#17346F',
    fontWeight: 'bold',
    marginTop: 12,
  },

  muted: {
    color: '#7A8499',
    marginTop: 5,
    marginBottom: 18,
  },

  input: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },

  mainButton: {
    marginTop: 12,
    borderRadius: 10,
  },

  buttonContent: {
    height: 50,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  welcomeCard: {
    backgroundColor: BLUE,
    padding: 22,
    borderRadius: 16,
    marginBottom: 28,
  },

  welcomeText: {
    color: '#E4ECFF',
    marginTop: 10,
    lineHeight: 22,
  },

  sectionTitle: {
    color: '#17346F',
    fontWeight: 'bold',
    marginBottom: 15,
  },

  featureCard: {
    borderRadius: 13,
    marginBottom: 15,
    backgroundColor: '#FFFFFF',
  },

  featureContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingVertical: 8,
  },

  featureIcon: {
    backgroundColor: '#E4ECFF',
  },

  noteInput: {
    minHeight: 130,
    backgroundColor: '#FFFFFF',
    marginTop: 20,
  },

  profileHeader: {
    alignItems: 'center',
    paddingTop: 25,
  },
});
